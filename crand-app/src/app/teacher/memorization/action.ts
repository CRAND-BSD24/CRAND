"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export type MemorizationStudent = {
  id: string;
  name: string;
  class_name: string;
  semester: string;
  email: string;
  academic_year: string;
  juz_name: string;
  pages: string;
  status: string;
  notes: string;
  teacher_id: string;
  quran_memorization_id: string;
  created_at?: Date;
};

export interface MemorizationData {
  student_id: string;
  semester: string;
  academic_year: string;
  juz_name: string;
  pages: string;
  status: string;
  notes: string;
}

export type MemorizationHistory = {
  id: string;
  semester: string;
  academic_year: string;
  juz_name: string;
  pages: string;
  status: string;
  notes: string;
  created_at: Date;
};

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

    console.log("Teacher found:", teacher);

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
        $lookup: {
          from: "quran_memorization",
          let: { memorizationId: { $arrayElemAt: ["$grades.quran_memorization_id", 0] } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$memorizationId"] }
              }
            }
          ],
          as: "memorization",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          grades: { $arrayElemAt: ["$grades", 0] },
          memorization: { $arrayElemAt: ["$memorization", 0] },
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      {
        $project: {
          id: "$_id",
          name: 1,
          class_name: "$class.class_name",
          semester: "$grades.semester",
          academic_year: "$grades.academic_year",
          juz_name: "$memorization.name",
          pages: "$grades.pages",
          status: "$grades.status",
          notes: "$grades.notes",
          teacher_id: "$class.teacher_id",
          quran_memorization_id: "$grades.quran_memorization_id",
          created_at: "$grades.created_at",
          email: "$user.email",
          user_id: "$user_id",
          user_data: "$user",
        },
      },
    ];
    
    const result = await db.collection("students").aggregate(pipeline).toArray();
    
    console.log("Raw aggregation result:", JSON.stringify(result, null, 2));
    
    const mappedResult = result.map((doc) => {
      return {
        id: doc._id.toString(),
        name: doc.name || "",
        email: doc.user_data.email || "",
        class_name: doc.class?.class_name || "",
        semester: doc.semester || "",
        academic_year: doc.academic_year || "",
        juz_name: doc.name || "",
        pages: doc.pages || "",
        status: doc.status || "Belum Ada",
        notes: doc.notes || "",
        teacher_id: doc.class?.teacher_id?.toString() || "",
        quran_memorization_id: doc.quran_memorization_id?.toString() || "",
        created_at: doc.created_at || new Date(),
      };
    });

    console.log("Mapped result:", JSON.stringify(mappedResult, null, 2));

    return mappedResult;
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

export async function updateMemorizationData(
  studentId: string,
  data: {
    semester: string;
    academic_year: string;
    quran_memorization_id: string;
    pages: string;
    status: string;
    notes: string;
  }
) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    // Update memorization_grades collection
    const result = await db.collection("memorization_grades").updateOne(
      { student_id: new ObjectId(studentId) },
      {
        $set: {
          semester: data.semester,
          academic_year: data.academic_year,
          quran_memorization_id: new ObjectId(data.quran_memorization_id),
          pages: data.pages,
          status: data.status,
          notes: data.notes,
          updated_at: new Date(),
        },
      },
      { upsert: true }
    );

    return { success: true, id: result.upsertedId?.toString() };
  } catch (error) {
    console.error("Error updating memorization data:", error);
    throw error;
  }
}

export async function getMemorizationHistory(
  studentId: string,
  startDate?: Date,
  endDate?: Date
): Promise<MemorizationHistory[]> {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const matchStage: any = {
      student_id: new ObjectId(studentId)
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      matchStage.created_at = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const pipeline = [
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: "quran_memorization",
          localField: "quran_memorization_id",
          foreignField: "_id",
          as: "memorization"
        }
      },
      {
        $unwind: "$memorization"
      },
      {
        $sort: { created_at: -1 }
      }
    ];

    const result = await db
      .collection("memorization_grades")
      .aggregate(pipeline)
      .toArray();

    return result.map((doc) => ({
      id: doc._id.toString(),
      semester: doc.semester || "",
      academic_year: doc.academic_year || "",
      juz_name: doc.memorization.name || "",
      pages: doc.pages || "",
      status: doc.status || "",
      notes: doc.notes || "",
      created_at: doc.created_at || new Date()
    }));
  } catch (error) {
    console.error("Error fetching memorization history:", error);
    throw error;
  }
}

export async function addMemorizationData(
  studentId: string,
  data: {
    semester: string;
    academic_year: string;
    quran_memorization_id: string;
    pages: string;
    status: string;
    notes: string;
  }
) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const result = await db.collection("memorization_grades").insertOne({
      student_id: new ObjectId(studentId),
      semester: data.semester,
      academic_year: data.academic_year,
      quran_memorization_id: new ObjectId(data.quran_memorization_id),
      pages: data.pages,
      status: data.status,
      notes: data.notes,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    console.error("Error adding memorization data:", error);
    throw error;
  }
} 