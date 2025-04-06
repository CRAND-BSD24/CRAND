'use server';

import { getMongoClientInstance } from "@/db/config/connection";

export const getAllGrades = async () => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const grades = await db.collection("grades").aggregate([
      {
        $lookup: {
          from: "students", // join ke koleksi siswa
          localField: "student_id",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $lookup: {
          from: "subjects", // join ke koleksi mata pelajaran
          localField: "subject_id",
          foreignField: "_id",
          as: "subject"
        }
      },
      {
        $unwind: "$student" // karena hasil lookup berupa array
      },
      {
        $unwind: "$subject"
      },
      {
        $project: {
          _id: 1,
          semester: 1,
          academic_year: 1,
          score: 1,
          student_name: "$student.name",
          subject_name: "$subject.name"
        }
      }
    ]).toArray();
    console.log(grades, "grades");

    return JSON.stringify(grades);
  } catch (error) {
    console.error("Error fetching grades with names:", error);
    return JSON.stringify([]);
  }
};
