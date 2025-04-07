'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export const getStudentById = async (id: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const student = await db.collection("students").findOne({ _id: new ObjectId(id) });

    if (!student) return null;

    const birth_place_date = student.birth_place && student.birth_date
      ? `${student.birth_place}, ${new Date(student.birth_date).toLocaleDateString("id-ID")}`
      : undefined;

    return JSON.stringify({
      id: student._id.toString(),
      name: student.name || "-",
      email: student.email || "-",
      phone_number: student.phone_number || "-",
      program: student.program || "-",
      gender: student.gender || "-",
      address: student.address || "-",
      class: student.class || "-",
      batch_year: student.batch_year?.toString() || "-",
      birth_place_date,
      graduation_status: student.graduation_status || "-",
      payment_status: student.payment_status || "-",
      profile_picture: student.profile_picture || "https://via.placeholder.com/150",
      created_at: student.created_at || new Date(),
      updated_at: student.updated_at || new Date(),
    });
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    return null;
  }
};

export const updateStudentById = async (id: string, updatedData: any) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const result = await db.collection("students").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updatedData,
          updated_at: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating student:", error);
    return false;
  }
};

export const deleteStudentById = async (id: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const result = await db.collection("students").deleteOne({
      _id: new ObjectId(id),
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting student:", error);
    return false;
  }
};