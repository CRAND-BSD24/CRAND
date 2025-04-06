'use server';

import { getMongoClientInstance } from "@/db/config/connection";

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
