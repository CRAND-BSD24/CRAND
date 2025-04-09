"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { getMongoClientInstance } from "@/db/config/connection";

interface MemorizationData {
  _id: string;
  semester: string;
  academic_year: string;
  pages: number;
  notes: string;
  status: string;
  updated_at: string;
  quran_memorization?: {
    surah: string;
    start_verse: number;
    end_verse: number;
  };
  student_info?: {
    name: string;
    class_id: string;
    academic_level: string;
  };
}

export const getMemorizationByStudentId = async (): Promise<MemorizationData | null> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const userId = session.user.id;
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const result = await db.collection("memorization_grades").aggregate([
    {
      $lookup: {
        from: "students",
        localField: "student_id",
        foreignField: "_id",
        as: "student_info"
      }
    },
    { $unwind: "$student_info" },
    {
      $match: {
        "student_info.user_id": new ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: "quran_memorization",
        localField: "quran_memorization_id",
        foreignField: "_id",
        as: "quran_memorization"
      }
    },
    { $unwind: "$quran_memorization" },
    {
      $project: {
        _id: { $toString: "$_id" },
        semester: 1,
        academic_year: 1,
        pages: 1,
        notes: 1,
        status: 1,
        updated_at: {
          $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$updated_at" }
        },
        quran_memorization: {
          surah: "$quran_memorization.surah",
          start_verse: "$quran_memorization.start_verse",
          end_verse: "$quran_memorization.end_verse"
        },
        student_info: {
          name: "$student_info.name",
          class_id: { $toString: "$student_info.class_id" },
          academic_level: "$student_info.academic_level"
        }
      }
    },
    { $limit: 1 }
  ]).toArray();

  return result[0] as MemorizationData || null;
};

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

export async function getMemorizationHistory(
  startDate?: Date,
  endDate?: Date
): Promise<MemorizationHistory[]> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const userId = session.user.id;
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  try {
    const matchStage: { 
      "student_info.user_id": ObjectId;
      created_at?: {
        $gte: Date;
        $lte: Date;
      };
    } = {
      "student_info.user_id": new ObjectId(userId)
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
        $lookup: {
          from: "students",
          localField: "student_id",
          foreignField: "_id",
          as: "student_info"
        }
      },
      { $unwind: "$student_info" },
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
