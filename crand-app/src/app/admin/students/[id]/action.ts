'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export const getStudentById = async (id: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const student = await db.collection("prospective_students").findOne({ _id: new ObjectId(id) });

    if (!student) {
      return null;
    }

    return JSON.stringify(student);
  } catch (error) {
    console.error("Error getting student by ID:", error);
    return null;
  }
};
