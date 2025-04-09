"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { getStudentsByTeacherId } from "../attendance/action";

export interface AcademicData {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  nisn: string;
}

export async function getAcademicData(): Promise<AcademicData[]> {
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

    return result.map((doc) => ({
      id: doc._id.toString(),
      student_id: doc._id.toString(),
      student_name: doc.name || "",
      class_name: doc.class?.class_name || "",
      nisn: doc.nisn || "",
    }));
  } catch (error) {
    console.error("Error fetching academic data:", error);
    throw error;
  }
}
