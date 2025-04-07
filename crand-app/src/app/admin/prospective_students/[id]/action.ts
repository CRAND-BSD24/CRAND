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

export const updateStudentById = async (id: string, updatedData: any) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const result = await db.collection("prospective_students").updateOne(
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
    const result = await db.collection("prospective_students").deleteOne({
      _id: new ObjectId(id),
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting student:", error);
    return false;
  }
};
