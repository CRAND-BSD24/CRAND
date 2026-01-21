"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export type TeacherItem = {
  id: string;
  name: string;
  email?: string;
};

export type MemorizationStudent = {
  id: string;
  name: string;
  halaqah_name: string;
  class_name?: string;
  semester?: string;
  academic_year?: string;
  juz_name?: string;
  surah?: string;
  pages?: string;
  status?: string;
  notes?: string;
  created_at?: Date;
  weekly_total_pages?: number;
};

export type TeacherAttendanceRecord = {
  id: string;
  date: Date;
  timestamp: string;
  is_late?: boolean;
  late_minutes?: number;
  photo?: string; // base64 string atau url
};

export async function getAllTeachersForMemorize(): Promise<TeacherItem[]> {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const teachers = await db
      .collection("teachers")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        // Hanya ambil user dengan role 'teacher'
        { $match: { "user.role": "teacher" } },
        {
          $project: {
            id: { $toString: "$_id" },
            name: "$user.name",
            email: "$user.email",
          },
        },
        { $sort: { name: 1 } },
      ])
      .toArray();

    return teachers as unknown as TeacherItem[];
  } catch (error) {
    console.error("Error fetching teachers for memorize:", error);
    return [];
  }
}

// Ambil siswa beserta setoran hafalan terbaru (dari koleksi memorization_grades) untuk ustadz tertentu
export async function getStudentsMemorizationByTeacher(
  teacherId: string
): Promise<MemorizationStudent[]> {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
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
          preserveNullAndEmptyArrays: true,
        },
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
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "halaqah.teacher_id": new ObjectId(teacherId),
        },
      },
      {
        $lookup: {
          from: "memorization_grades",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$student_id", "$$studentId"] },
              },
            },
            { $sort: { created_at: -1 } },
            { $limit: 1 },
          ],
          as: "grades",
        },
      },
      {
        $lookup: {
          from: "quran_memorization",
          let: {
            memorizationId: { $arrayElemAt: ["$grades.quran_memorization_id", 0] },
          },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$_id", "$$memorizationId"] } },
            },
          ],
          as: "memorization",
        },
      },
      {
        $addFields: {
          grades: { $arrayElemAt: ["$grades", 0] },
          memorization: { $arrayElemAt: ["$memorization", 0] },
        },
      },
      {
        $project: {
          id: { $toString: "$_id" },
          name: 1,
          class_name: "$class.class_name",
          halaqah_name: "$halaqah.name",
          semester: "$grades.semester",
          academic_year: "$grades.academic_year",
          juz_name: "$memorization.name",
          surah: "$grades.surah",
          pages: "$grades.pages",
          status: "$grades.status",
          notes: "$grades.notes",
          created_at: "$grades.created_at",
        },
      },
      {
        $addFields: {
          class_level: {
            $convert: {
              input: {
                $arrayElemAt: [
                  {
                    $regexFindAll: {
                      input: "$class_name",
                      regex: /\d+/,
                    },
                  },
                  0,
                ],
              },
              to: "int",
              onError: 999,
            },
          },
        },
      },
      { $sort: { class_level: 1, name: 1 } },
    ];

    const result = await db.collection("students").aggregate(pipeline).toArray();
    return result as unknown as MemorizationStudent[];
  } catch (error) {
    console.error("Error fetching students memorization by teacher:", error);
    throw error;
  }
}

// Total hafalan per minggu untuk setiap santri di bawah ustadz tertentu
export async function getWeeklyMemorizationByTeacher(
  teacherId: string,
  startDate: Date,
  endDate: Date
): Promise<MemorizationStudent[]> {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const pipeline = [
      {
        $lookup: {
          from: "halaqah",
          localField: "halaqah_id",
          foreignField: "_id",
          as: "halaqah",
        },
      },
      { $unwind: { path: "$halaqah", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "class_id",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } },
      { $match: { "halaqah.teacher_id": new ObjectId(teacherId) } },
      {
        $lookup: {
          from: "memorization_grades",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$student_id", "$$studentId"] },
                created_at: { $gte: startDate, $lte: endDate },
              },
            },
            { $addFields: { pages_int: { $convert: { input: "$pages", to: "int", onError: 0, onNull: 0 } } } },
            { $sort: { created_at: -1 } },
            {
              $group: {
                _id: null,
                totalPages: { $sum: "$pages_int" },
                lastRecord: { $first: "$$ROOT" },
              },
            },
          ],
          as: "weekly",
        },
      },
      {
        $addFields: {
          weekly_total_pages: { $ifNull: [{ $arrayElemAt: ["$weekly.totalPages", 0] }, 0] },
          last_grade: { $arrayElemAt: ["$weekly.lastRecord", 0] },
        },
      },
      {
        $lookup: {
          from: "quran_memorization",
          localField: "last_grade.quran_memorization_id",
          foreignField: "_id",
          as: "memorization",
        },
      },
      { $addFields: { memorization: { $arrayElemAt: ["$memorization", 0] } } },
      {
        $project: {
          id: { $toString: "$_id" },
          name: 1,
          class_name: "$class.class_name",
          halaqah_name: "$halaqah.name",
          weekly_total_pages: 1,
          semester: "$last_grade.semester",
          academic_year: "$last_grade.academic_year",
          juz_name: "$memorization.name",
          surah: "$last_grade.surah",
          pages: "$last_grade.pages",
          status: "$last_grade.status",
          notes: "$last_grade.notes",
          created_at: "$last_grade.created_at",
        },
      },
      { $sort: { name: 1 } },
    ];

    const result = await db.collection("students").aggregate(pipeline).toArray();
    return result as unknown as MemorizationStudent[];
  } catch (error) {
    console.error("Error fetching weekly memorization by teacher:", error);
    throw error;
  }
}

// Riwayat absensi ustadz berdasarkan teacherId (ID dokumen teachers)
export async function getTeacherAttendanceHistory(
  teacherId: string,
  startDate?: Date,
  endDate?: Date
): Promise<TeacherAttendanceRecord[]> {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const match: any = {
      teacher_id: new ObjectId(teacherId),
      type: "teacher",
    };
    if (startDate && endDate) {
      match.created_at = { $gte: startDate, $lte: endDate };
    }

    const records = await db
      .collection("attendance")
      .find(match)
      .sort({ created_at: -1 })
      .toArray();

    return records.map((r: any) => ({
      id: r._id?.toString?.() ?? "",
      date: r.created_at ?? r.date ?? new Date(),
      timestamp: new Date(r.created_at ?? r.date ?? new Date()).toLocaleString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      is_late: r.is_late ?? false,
      late_minutes: r.late_minutes ?? 0,
      photo:
        typeof r.photo === "string"
          ? r.photo
          : r.photo?.buffer
          ? Buffer.from(r.photo.buffer).toString("base64")
          : undefined,
    }));
  } catch (error) {
    console.error("Error fetching teacher attendance history:", error);
    throw error;
  }
}