"use server";

import { getMongoClientInstance } from "@/db/config/connection";
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

function convertDate(date: Date | string | undefined): string {
  try {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString();
  } catch {
    return "";
  }
}

export async function getStudentsForEducator(): Promise<AggregatedStudentData[]> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || session.user.role !== "educator") {
    throw new Error("Unauthorized");
  }

  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    // Dapatkan teacher record yang terkait dengan educator (melalui user_id)
    const teacher = await db.collection("teachers").findOne({
      user_id: new ObjectId(session.user.id),
    });

    if (!teacher) {
      throw new Error("Educator's teacher record not found");
    }

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
          "class.teacher_id": teacher._id,
        },
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
              onError: 999,
            },
          },
        },
      },
      // Sorting berdasarkan kelas (7-12) kemudian nama (A-Z)
      {
        $sort: {
          class_level: 1,
          name: 1,
        },
      },
    ];

    const result = await db.collection("students").aggregate(pipeline).toArray();

    return result.map((doc) => ({
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
    }));
  } catch (error) {
    console.error("Error fetching students for educator:", error);
    throw error;
  }
}