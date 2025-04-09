"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
}

export async function createAttendance(data: AttendanceData) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const result = await db.collection("class_attendance").insertOne({
      student_id: new ObjectId(data.student_id),
      date: data.date,
      status: data.status,
      created_at: new Date(),
      updated_at: new Date(),
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
    const teacher = await db.collection("teachers").findOne({
      user_id: new ObjectId(session.user.id),
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    const pipeline = [
      {
        $lookup: {
          from: "classes",
          localField: "class_id",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $unwind: "$class",
      },
      {
        $match: {
          "class.teacher_id": teacher._id,
        },
      },
    ];

    const result = await db
      .collection("students")
      .aggregate(pipeline)
      .toArray();
    // console.log(result, "tes");
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
        teacher_id: doc.class?.teacher_id?.toString() || "",
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
          $sort: { date: -1 }
        }
      ])
      .toArray();

    return result.map((doc) => ({
      id: doc._id.toString(),
      date: doc.date,
      status: doc.status,
      created_at: doc.created_at
    }));
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    throw error;
  }
}
