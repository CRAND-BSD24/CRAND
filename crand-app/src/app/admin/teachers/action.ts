'use server';

import { getMongoClientInstance } from '@/db/config/connection';
import { ObjectId } from "mongodb";

export const getAllTeachers = async () => {
  const client = await getMongoClientInstance();
  const db = client.db('pesantren_db');

  try {
    const teachers = await db.collection('teachers').aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
      ]).toArray();
  
      return JSON.stringify(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return JSON.stringify([]);
  }
};

export const createTeacher = async (formData: any) => {
  const client = await getMongoClientInstance();
  const db = client.db('pesantren_db');

  try {
    const result = await db.collection('teachers').insertOne({
      ...formData,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return result.insertedId ? true : false;
  } catch (error) {
    console.error('Error creating teacher:', error);
    return false;
  }
};

export const getTeacherById = async (id: string) => {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
  
    try {
      const teacher = await db.collection("teachers").aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]).toArray();
  
      return JSON.stringify(teacher[0]);
    } catch (error) {
      console.error("Error fetching teacher by id:", error);
      return JSON.stringify(null);
    }
};

export const updateTeacher = async (id: string, updatedData: any) => {
    const client = await getMongoClientInstance();
    const db = client.db('pesantren_db');
  
    try {
      const teacherId = new ObjectId(id);
      const userId = new ObjectId(updatedData.user_id);
  
      // Update data user
      await db.collection('users').updateOne(
        { _id: userId },
        {
          $set: {
            name: updatedData.name,
            email: updatedData.email,
            phone_number: updatedData.phone_number,
            updated_at: new Date(),
          },
        }
      );
  
      await db.collection('teachers').updateOne(
        { _id: teacherId },
        {
          $set: {
            nip: updatedData.nip,
            updated_at: new Date(),
          },
        }
      );
  
      return true;
    } catch (error) {
      console.error('Error updating teacher:', error);
      return false;
    }
  };