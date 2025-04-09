"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

interface AcademicData {
  _id: string;
  student_id: string;
  subject_id: string;
  semester: string;
  academic_year: string;
  score: number;
  created_at: string;
  updated_at: string;
  student_info?: {
    name: string;
    class_id: string;
    academic_level: string;
  };
}

const isValidDate = (date: any) => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

export const getAcademicByStudentId = async (): Promise<
  AcademicData[] | null
> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  const userId = session.user.id;

  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  // cari student berdasarkan user id
  const student = await db.collection("students").findOne({
    user_id: new ObjectId(userId),
  });

  if (!student) return null;

  const results = await db
    .collection("grades")
    .aggregate([
      {
        $match: {
          student_id: student._id,
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "student_id",
          foreignField: "_id",
          as: "student_info",
        },
      },
      { $unwind: "$student_info" },
      {
        $project: {
          _id: 1,
          student_id: 1,
          subject_id: 1,
          semester: 1,
          academic_year: 1,
          score: 1,
          created_at: 1,
          updated_at: 1,
          student_info: {
            name: "$student_info.name",
            class_id: { $toString: "$student_info.class_id" },
            academic_level: "$student_info.academic_level",
          },
        },
      },
    ])
    .toArray();

  console.log(results, "results");

  const academics: AcademicData[] = results.map((doc) => ({
    _id: doc._id.toString(),
    student_id: doc.student_id.toString(),
    subject_id: doc.subject_id.toString(),
    semester: doc.semester,
    academic_year: doc.academic_year,
    score: parseFloat(doc.score?.toString() || "0"),
    created_at: isValidDate(doc.created_at)
      ? new Date(doc.created_at).toISOString()
      : "Invalid Date",
    updated_at: isValidDate(doc.updated_at)
      ? new Date(doc.updated_at).toISOString()
      : "Invalid Date",
    student_info: {
      name: doc.student_info.name,
      class_id: doc.student_info.class_id,
      academic_level: doc.student_info.academic_level,
    },
  }));

  return academics;
};
