// app/teachers/action.ts
"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

// Ambil semua data teacher
export const getAllTeachers = async () => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const teachers = await db.collection("teachers").aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_data",
        },
      },
      { $unwind: "$user_data" },
      {
        $project: {
          _id: 1,
          user_id: 1,
          name: "$user_data.name",
          phone_number: "$user_data.phone_number",
          address: 1,
          nip: 1,
          email: "$user_data.email",
        },
      },
    ]).toArray();

    return JSON.stringify(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return JSON.stringify([]);
  }
};

// Tambah data teacher baru
export const createTeacher = async (newTeacher: {
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
  nip?: string;
}) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const userResult = await db.collection("users").insertOne({
      name: newTeacher.name,
      phone_number: newTeacher.phone_number,
      email: newTeacher.email,
    });

    await db.collection("teachers").insertOne({
      user_id: userResult.insertedId,
      address: newTeacher.address,
      nip: newTeacher.nip,
    });

    return { message: "Teacher created successfully" };
  } catch (error) {
    console.error("Error creating teacher:", error);
    throw error;
  }
};

// Hapus teacher berdasarkan _id
export const deleteTeacher = async (id: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const teacher = await db.collection("teachers").findOne({ _id: new ObjectId(id) });

    if (!teacher) throw new Error("Teacher not found");

    await db.collection("teachers").deleteOne({ _id: new ObjectId(id) });
    await db.collection("users").deleteOne({ _id: teacher.user_id });

    return { message: "Teacher deleted successfully" };
  } catch (error) {
    console.error("Error deleting teacher:", error);
    throw error;
  }
};

// Update data teacher
export const updateTeacher = async (updatedTeacher: {
  _id: string;
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
  nip?: string;
}) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const teacher = await db.collection("teachers").findOne({ _id: new ObjectId(updatedTeacher._id) });

    if (!teacher) throw new Error("Teacher not found");

    await db.collection("users").updateOne(
      { _id: teacher.user_id },
      {
        $set: {
          name: updatedTeacher.name,
          phone_number: updatedTeacher.phone_number,
          email: updatedTeacher.email,
        },
      }
    );

    await db.collection("teachers").updateOne(
      { _id: new ObjectId(updatedTeacher._id) },
      {
        $set: {
          address: updatedTeacher.address,
          nip: updatedTeacher.nip,
        },
      }
    );

    return { message: "Teacher updated successfully" };
  } catch (error) {
    console.error("Error updating teacher:", error);
    throw error;
  }
};