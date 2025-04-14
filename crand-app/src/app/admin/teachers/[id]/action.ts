"use server";

import { ObjectId } from "mongodb";
import { getMongoClientInstance } from "@/db/config/connection";

export async function getTeacherById(id: string) {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    const teacher = await db.collection("teachers").findOne({
      _id: new ObjectId(id),
    });

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    return JSON.stringify(teacher);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    throw error;
  }
}

export async function updateTeacher(id: string, formData: any) {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    const result = await db.collection("teachers").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...formData,
          updated_at: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error("Teacher not found");
    }

    return true;
  } catch (error) {
    console.error("Error updating teacher:", error);
    return false;
  }
}

export async function deleteTeacher(id: string) {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    const result = await db.collection("teachers").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      throw new Error("Teacher not found");
    }

    return true;
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return false;
  }
}
