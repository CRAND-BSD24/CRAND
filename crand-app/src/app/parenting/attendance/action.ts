"use server";

import { getMongoClientInstance } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export interface AggregatedStudentData {
  id: string;
  name: string;
  nisn: string;
  program: string;
  level: number;
  academic_level: string;
  gender: string;
  address: string;
  birth_place_date: string;
  ekskul: string;
  VA_SPP: string;
  graduation_status: string;
  class_name: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceData {
  student_id: string;
  date: Date;
  status: "Present" | "Sick" | "Permission" | "Absent";
}

export interface AttendanceHistory {
  id: string;
  date: Date;
  status: "Present" | "Sick" | "Permission" | "Absent";
  created_at: Date;
  shift_time?: string;
}

import { getCurrentShift, isValidAttendanceTime } from '@/lib/shift-utils';

const isWithinRadius = (
  userLat: number,
  userLng: number,
  locations: Array<{ lat: number; lng: number }>,
  radius: number
): boolean => {
  const R = 6371e3; // Earth's radius in meters

  for (const location of locations) {
    const φ1 = (userLat * Math.PI) / 180;
    const φ2 = (location.lat * Math.PI) / 180;
    const Δφ = ((location.lat - userLat) * Math.PI) / 180;
    const Δλ = ((location.lng - userLng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance <= radius) {
      return true;
    }
  }
  return false;
};

export async function createAttendance(data: AttendanceData) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const now = new Date();
    const role: 'teacher' | 'educator' = 'teacher';
    const BUFFER_MINUTES = 10;
    const validity = isValidAttendanceTime(now, role, BUFFER_MINUTES);
    if (!validity.isValid) {
      throw new Error(validity.message);
    }
    const shift_time = getCurrentShift(now);

    const result = await db.collection("class_attendance").insertOne({
      student_id: new ObjectId(data.student_id),
      date: data.date,
      status: data.status,
      created_at: now,
      updated_at: now,
      shift_time: shift_time,
      is_late: Boolean(validity.isLate),
      late_minutes: validity.lateMinutes || 0,
    });

    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    console.error("Error creating attendance:", error);
    throw error;
  }
}

export async function getStudentsByTeacherId(): Promise<
  AggregatedStudentData[]
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    let matchStage: any = {};

    if (session.user.role === 'teacher') {
      const teacher = await db.collection("teachers").findOne({
        user_id: new ObjectId(session.user.id),
      });

      if (!teacher) {
        throw new Error("Teacher not found");
      }
      
      matchStage = {
        "halaqah.teacher_id": teacher._id,
      };
    }
    // For parenting role, no specific teacher filter is applied

    // Aggregate pipeline to get students based on halaqah, not class
    const pipeline = [
      {
        $lookup: {
          from: "halaqah",
          localField: "halaqah_id",
          foreignField: "_id",
          as: "halaqah",
        },
      },
      {
        $unwind: {
          path: "$halaqah",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "class_id",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $unwind: {
          path: "$class",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: matchStage
      },
      // Menambahkan field untuk sorting kelas
      {
        $addFields: {
          class_level: {
            $convert: {
              input: {
                $arrayElemAt: [
                  {
                    $regexFindAll: {
                      input: "$class.class_name",
                      regex: /\d+/
                    }
                  },
                  0
                ]
              },
              to: "int",
              onError: 999
            }
          }
        }
      },
      // Sorting berdasarkan kelas (7-12) kemudian nama (A-Z)
      {
        $sort: {
          "class_level": 1,  // Urutkan berdasarkan angka kelas
          "name": 1          // Kemudian urutkan berdasarkan nama A-Z
        }
      }
    ];

    const result = await db
      .collection("students")
      .aggregate(pipeline)
      .toArray();

    // Konversi hasil ke plain object
    return result.map((doc) => {
      // Fungsi helper untuk mengkonversi tanggal
      const convertDate = (date: any): string => {
        if (!date) return new Date().toISOString();
        if (date instanceof Date) return date.toISOString();
        if (typeof date === "string") return date;
        return new Date().toISOString();
      };

      return {
        id: doc._id.toString(),
        name: doc.name || "",
        nisn: doc.nisn || "",
        program: doc.program || "",
        level: doc.level || 0,
        academic_level: doc.academic_level || "",
        gender: doc.gender || "",
        address: doc.address || "",
        birth_place_date: doc.birth_place_date || "",
        ekskul: doc.ekskul || "",
        VA_SPP: doc.VA_SPP || "",
        graduation_status: doc.graduation_status || "",
        class_name: doc.class?.class_name || "",
        teacher_id: doc.halaqah?.teacher_id?.toString() || "",
        created_at: convertDate(doc.created_at),
        updated_at: convertDate(doc.updated_at),
      };
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
}

export async function getAttendanceStatus(studentIds: string[]) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const attendanceRecords = await db
      .collection("class_attendance")
      .find({
        student_id: { $in: studentIds.map((id) => new ObjectId(id)) },
        date: { $gte: today },
      })
      .toArray();

    const statusMap: Record<string, string> = {};
    attendanceRecords.forEach((record) => {
      statusMap[record.student_id.toString()] = record.status;
    });

    return statusMap;
  } catch (error) {
    console.error("Error fetching attendance status:", error);
    throw error;
  }
}

export async function getAttendanceHistory(
  studentId: string,
  startDate?: Date,
  endDate?: Date
): Promise<AttendanceHistory[]> {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const matchStage: any = {
      student_id: new ObjectId(studentId)
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      matchStage.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const result = await db
      .collection("class_attendance")
      .aggregate([
        {
          $match: matchStage
        },
        {
          $addFields: {
            shift_time: {
              $let: {
                vars: {
                  hour: { $hour: "$created_at" },
                  minute: { $minute: "$created_at" },
                  dayOfWeek: { $dayOfWeek: "$date" }
                },
                in: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $and: [
                            { $gte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 240] },
                            { $lte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 285] }
                          ]
                        },
                        then: "04:00 - 04:45"
                      },
                      {
                        case: {
                          $and: [
                            { $gte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 360] },
                            { $lte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 420] }
                          ]
                        },
                        then: "06:00 - 07:00"
                      },
                      {
                        case: {
                          $and: [
                            { $gte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 480] },
                            { $lte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 540] }
                          ]
                        },
                        then: "08:00 - 09:00"
                      },
                      {
                        case: {
                          $and: [
                            { $in: ["$$dayOfWeek", [2, 5]] },
                            { $gte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 960] },
                            { $lte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 1035] }
                          ]
                        },
                        then: "16:00 - 17:15"
                      },
                      {
                        case: {
                          $and: [
                            { $in: ["$$dayOfWeek", [3, 4, 6]] },
                            { $gte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 1110] },
                            { $lte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 1200] }
                          ]
                        },
                        then: "18:30 - 20:00"
                      }
                    ],
                    default: "Di luar jadwal"
                  }
                }
              }
            }
          }
        },
        {
          $sort: { date: -1, created_at: -1 }
        }
      ])
      .toArray();

    return result.map((doc) => ({
      id: doc._id.toString(),
      date: doc.date,
      status: doc.status,
      created_at: doc.created_at,
      shift_time: doc.shift_time
    }));
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    throw error;
  }
}
