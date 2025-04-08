"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const getMemorizationByStudentId = async () => {
  const session = await authOptions();
  if (!session || session.user.role !== "student") return null;

  const client = await getMongoClientInstance();
  const db = client.db();

  const userId = new ObjectId(session.user.id);

  const student = await db.collection("students").findOne({ user_id: userId });
  if (!student) return null;

  const memorization = await db.collection("memorization_grades").findOne(
    { student_id: student._id },
    { sort: { updated_at: -1 } }
  );

  if (!memorization) return null;

  const quranMemorization = await db
    .collection("quran_memorization")
    .findOne({ _id: memorization.quran_memorization_id });

  return {
    ...memorization,
    _id: memorization._id.toString(),
    student_info: {
      name: student.name,
    },
    quran_memorization_info: {
      name: quranMemorization?.name || "",
    },
  };
};
