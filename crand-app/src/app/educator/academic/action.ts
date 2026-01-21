"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export interface AcademicData {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  nisn: string;
}

export async function getAcademicDataForEducator(): Promise<AcademicData[]> {
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
      student_id: doc._id.toString(),
      student_name: doc.name || "",
      class_name: doc.class?.class_name || "",
      nisn: doc.nisn || "",
    }));
  } catch (error) {
    console.error("Error fetching academic data for educator:", error);
    throw error;
  }
}