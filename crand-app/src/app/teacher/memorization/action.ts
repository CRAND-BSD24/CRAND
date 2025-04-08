"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export interface MemorizationStudent {
  id: string;
  name: string;
  class_name: string;
  semester: string;
  academic_year: string;
  juz_name: string;
  pages: string;
  status: string;
  notes: string;
  teacher_id: string;
}

export interface MemorizationData {
  student_id: string;
  semester: string;
  academic_year: string;
  juz_name: string;
  pages: string;
  status: string;
  notes: string;
}

export async function getStudentMemorization(): Promise<MemorizationStudent[]> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    // Get teacher data first
    const teacher = await db.collection("teachers").findOne({
      user_id: new ObjectId(session.user.id),
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Aggregate pipeline to get students with their memorization data
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
      {
        $lookup: {
          from: "quran_memorization",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$student_id", "$$studentId"] }
              }
            },
            {
              $sort: { created_at: -1 }
            },
            {
              $limit: 1
            }
          ],
          as: "memorization",
        },
      },
      {
        $lookup: {
          from: "memorization_grades",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$student_id", "$$studentId"] }
              }
            },
            {
              $sort: { created_at: -1 }
            },
            {
              $limit: 1
            }
          ],
          as: "grades",
        },
      },
      {
        $addFields: {
          memorization: { $arrayElemAt: ["$memorization", 0] },
          grades: { $arrayElemAt: ["$grades", 0] }
        }
      }
    ];

    const result = await db
      .collection("students")
      .aggregate(pipeline)
      .toArray();

    return result.map((doc) => {
      const latestMemorization = doc.memorization || {};
      const latestGrade = doc.grades || {};

      return {
        id: doc._id.toString(),
        name: doc.name || "",
        class_name: doc.class?.class_name || "",
        semester: latestGrade.semester || "",
        academic_year: latestGrade.academic_year || "",
        juz_name: latestMemorization.name || "",
        pages: latestGrade.pages || "",
        status: latestGrade.status || "Belum Ada",
        notes: latestGrade.notes || "",
        teacher_id: doc.class?.teacher_id?.toString() || "",
      };
    });
  } catch (error) {
    console.error("Error fetching student memorization:", error);
    throw error;
  }
}

export async function updateMemorizationStatus(
  studentId: string,
  data: { status: string; notes: string }
) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const result = await db.collection("memorization_grades").updateOne(
      { student_id: new ObjectId(studentId) },
      {
        $set: {
          status: data.status,
          notes: data.notes,
          updated_at: new Date(),
        },
      },
      { upsert: true }
    );

    return { success: true, id: result.upsertedId?.toString() };
  } catch (error) {
    console.error("Error updating memorization status:", error);
    throw error;
  }
}

export async function addNewMemorization(data: MemorizationData) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    // Insert into quran_memorization collection
    const memorizationResult = await db.collection("quran_memorization").insertOne({
      student_id: new ObjectId(data.student_id),
      name: data.juz_name,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Insert into memorization_grades collection
    const gradeResult = await db.collection("memorization_grades").insertOne({
      student_id: new ObjectId(data.student_id),
      semester: data.semester,
      academic_year: data.academic_year,
      pages: data.pages,
      status: data.status,
      notes: data.notes,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      success: true,
      memorization_id: memorizationResult.insertedId.toString(),
      grade_id: gradeResult.insertedId.toString(),
    };
  } catch (error) {
    console.error("Error adding new memorization:", error);
    throw error;
  }
} 