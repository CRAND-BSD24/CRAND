'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export const getStudentById = async (id: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const student = await db.collection("prospective_students").findOne({ _id: new ObjectId(id) });

    console.log(student,'<< ini satu student yang diambil dari db >>');
    
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
    const formattedData = {
      profile_picture: updatedData.profile_picture,
      name: updatedData.name,
      email: updatedData.email,
      phone_number: updatedData.phone_number,
      program: updatedData.program,
      gender: updatedData.gender,
      address: updatedData.address,
      academic_level: updatedData.academic_level,
      academic_year: updatedData.academic_year,
      birth_place_date: updatedData.birth_place_date,
      nisn: updatedData.nisn,
      father_name: updatedData.father_name,
      mother_name: updatedData.mother_name,
      level: updatedData.level,
      payment_status: updatedData.payment_status,
      updated_at: new Date(),
    };

    const result = await db.collection("prospective_students").updateOne(
      { _id: new ObjectId(id) },
      { $set: formattedData }
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
