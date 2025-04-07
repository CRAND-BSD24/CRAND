'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export const getAllStudents = async () => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const students = await db.collection("prospective_students").find().toArray();
    return JSON.stringify(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return JSON.stringify([]);
  }
};

export const createStudent = async (formData: any) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const result = await db.collection("prospective_students").insertOne({
      ...formData,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return result.insertedId ? true : false;
  } catch (error) {
    console.error("Error creating student:", error);
    return false;
  }
};

export const acceptStudent = async (id: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const prospectiveCollection = db.collection("prospective_students");
  const studentsCollection = db.collection("students");
  const usersCollection = db.collection("users");

  try {
    const prospective = await prospectiveCollection.findOne({ _id: new ObjectId(id) });
    if (!prospective) {
      return { success: false, message: "Data calon santri tidak ditemukan." };
    }

    // Buat data student baru
    const studentResult = await studentsCollection.insertOne({
      name: prospective.name,
      gender: prospective.gender,
      address: prospective.address,
      parent_name: prospective.parent_name,
      phone_number: prospective.phone_number,
      academic_level: prospective.academic_level,
      class: prospective.class,
      birth_date: prospective.birth_date,
      birth_place: prospective.birth_place,
      batch_year: prospective.batch_year,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Hash password default
    const hashedPassword = await bcrypt.hash("student123!", 10);

    // Simpan user
    await usersCollection.insertOne({
      name: prospective.name,
      email: prospective.email,
      password: hashedPassword,
      role: "student",
      student_id: studentResult.insertedId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error accepting student:", error);
    return { success: false, message: "Terjadi kesalahan saat menerima santri." };
  }
};
