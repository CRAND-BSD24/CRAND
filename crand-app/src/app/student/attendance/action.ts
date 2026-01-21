"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export interface AttendanceRecord {
  _id: string;
  name: string;
  timestamp: Date;
  photo: Buffer;
}

export interface MonthlyAttendance {
  _id: string;
  name: string;
  class: string;
  attendance: {
    date: Date;
    status: "" | "Present" | "Absent" | "Sick" | "Permission" | "Holiday";
    photo?: string;
    timestamp?: string;
    shift_time?: string;
  }[];
}

// Fungsi untuk mengecek apakah suatu hari adalah hari Minggu
const isSunday = (date: Date): boolean => {
  return date.getDay() === 0;
};

// Fungsi untuk mengecek apakah suatu hari adalah libur nasional
const isNationalHoliday = (date: Date): boolean => {
  // Contoh libur nasional (tahun 2024)
  const nationalHolidays = [
    "2024-01-01", // Tahun Baru
    "2024-02-10", // Tahun Baru Imlek
    "2024-03-11", // Isra Mi'raj
    "2024-03-29", // Jumat Agung
    "2024-04-10", // Idul Fitri
    "2024-04-11", // Idul Fitri
    "2024-05-01", // Hari Buruh
    "2024-05-09", // Kenaikan Isa Almasih
    "2024-05-23", // Hari Raya Waisak
    "2024-06-01", // Hari Lahir Pancasila
    "2024-06-17", // Idul Adha
    "2024-07-07", // Tahun Baru Islam
    "2024-08-17", // Hari Kemerdekaan
    "2024-09-16", // Maulid Nabi
    "2024-12-25", // Natal
  ];

  const dateString = date.toISOString().split("T")[0];
  return nationalHolidays.includes(dateString);
};

export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    const attendanceCollection = db.collection("attendance");

    const records = await attendanceCollection
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    // console.log(records,"<<<<<");

    // Convert ObjectId to string and Binary photo to base64
    return records.map((record) => ({
      _id: record._id.toString(),
      name: record.name,
      timestamp: record.timestamp,
      photo: record.photo.buffer.toString("base64"),
    })) as AttendanceRecord[];
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return [];
  }
}

export async function getMonthlyAttendance(
  year: number,
  month: number,
  studentId: string
): Promise<MonthlyAttendance[]> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    // Ambil data siswa
    const studentsCollection = db.collection("students");
    const student = await studentsCollection.findOne({
      user_id: new ObjectId(studentId),
    });

    const kelas = await db.collection("classes").findOne({
      _id: new ObjectId(student?.class_id.toString()),
    });

    if (!student) {
      console.error("Student not found");
      return [];
    }

    // Ambil data absensi
    const attendanceCollection = db.collection("class_attendance");

    // Tentukan rentang tanggal
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const query = {
      student_id: new ObjectId(student._id.toString()),
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const attendanceRecords = await attendanceCollection
      .find(query)
      .sort({ date: 1, created_at: 1 })
      .toArray();

    // Generate attendance array untuk setiap hari dalam bulan
    const daysInMonth = endDate.getDate();
    const attendance = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month - 1, i + 1);

      // Cek apakah hari Minggu atau libur nasional
      if (isSunday(date) || isNationalHoliday(date)) {
        return {
          date,
          status: "Holiday" as const,
        };
      }

      // Cari record absensi untuk tanggal ini
      const record = attendanceRecords.find((record) => {
        const recordDate = new Date(record.date);
        return (
          recordDate.getDate() === date.getDate() &&
          recordDate.getMonth() === date.getMonth() &&
          recordDate.getFullYear() === date.getFullYear()
        );
      });

      // Jika tidak ada record dan tanggal sudah lewat, set Absent
      if (!record) {
        return {
          date,
          status: date > new Date() ? "" : "Absent" as const,
        };
      }

      // Gunakan status langsung dari database
      return {
        date,
        status: record.status === "Present" ? "Present" :
               record.status === "Sick" ? "Sick" :
               record.status === "Permission" ? "Permission" :
               record.status === "Absent" ? "Absent" :
               record.status === "Holiday" ? "Holiday" : "",
        photo: record.photo?.buffer.toString('base64'),
        timestamp: record.created_at?.toISOString(),
        shift_time: record.shift_time
      };
    });

    return [{
      _id: student._id.toString(),
      name: student.name,
      class: kelas?.class_name,
      attendance: attendance as MonthlyAttendance['attendance'],
    }];

  } catch (error) {
    console.error("Error fetching monthly attendance:", error);
    return [];
  }
}

export interface AttendanceHistory {
  date: Date;
  status: string;
  shift_time?: string;
  created_at?: Date;
  photo?: string;
}

export async function getAttendanceHistory(
  studentId: string,
  startDate?: Date,
  endDate?: Date
): Promise<AttendanceHistory[]> {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const student = await db.collection("students").findOne({
      user_id: new ObjectId(studentId)
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const matchStage: any = {
      student_id: new ObjectId(student._id.toString())
    };

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
                  minute: { $minute: "$created_at" }
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
                            { $gte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 330] },
                            { $lte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 420] }
                          ]
                        },
                        then: "05:30 - 07:00"
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
                            { $gte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 960] },
                            { $lte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 1035] }
                          ]
                        },
                        then: "16:00 - 17:15"
                      },
                      {
                        case: {
                          $and: [
                            { $gte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 1110] },
                            { $lte: [{ $add: [{ $multiply: ["$$hour", 60] }, "$$minute"] }, 1200] }
                          ]
                        },
                        then: "18:30 - 20:00"
                      }
                    ],
                    default: "Unknown"
                  }
                }
              }
            }
          }
        },
        {
          $sort: { date: 1, created_at: 1 }
        }
      ])
      .toArray();

    return result.map(record => ({
      date: record.date,
      status: record.status,
      shift_time: record.shift_time,
      created_at: record.created_at,
      photo: record.photo?.buffer.toString('base64')
    }));

  } catch (error) {
    console.error("Error fetching attendance history:", error);
    throw error;
  }
}