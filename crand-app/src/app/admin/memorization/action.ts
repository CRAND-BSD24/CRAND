'use server';

import { getMongoClientInstance } from "@/db/config/connection";

export const getAllMemorizationGrades = async () => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const grades = await db.collection("memorization_grades").aggregate([
    {
      $lookup: {
        from: "students",
        localField: "student_id",
        foreignField: "_id",
        as: "student"
      }
    },
    {
      $lookup: {
        from: "quran_memorization",
        localField: "quran_memorization_id",
        foreignField: "_id",
        as: "memorization"
      }
    },
    { $unwind: "$student" },
    { $unwind: "$memorization" },
    {
      $project: {
        _id: 1,
        semester: 1,
        academic_year: 1,
        pages: 1,
        notes: 1,
        status: 1,
        student_name: "$student.name",
        memorization_name: "$memorization.name",
        created_at: 1
      }
    }
  ]).toArray();
  console.log(grades, 'ini data hafalan grades');

  return JSON.stringify(grades);
};
