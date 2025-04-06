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
