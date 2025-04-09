// app/teachers/action.ts
"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

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

interface CreateTeacherInput {
  name: string;
  email: string;
  nip: string;
  phone_number: string;
  address: string;
}

export async function createTeacher(data: CreateTeacherInput) {
  try {
    const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
    const now = new Date().toISOString();

    // Hash the default password
    const hashedPassword = await bcrypt.hash("teacher123", 10);

    // Create user first
    const userResult = await db.collection('users').insertOne({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "teacher",
      phone_number: data.phone_number,
      profile_picture: "data:image/png;base64,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",
      created_at: new Date(),
      updated_at: new Date()
    });

    // Create teacher with reference to user
    const teacherResult = await db.collection('teachers').insertOne({
      user_id: userResult.insertedId,
      nip: data.nip,
      address: data.address,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Fetch the complete teacher data with user info
    const teacher = await db.collection('teachers').aggregate([
      {
        $match: {
          _id: teacherResult.insertedId
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: { $toString: '$_id' },
          nip: 1,
          address: 1,
          created_at: { $toString: '$created_at' },
          updated_at: { $toString: '$updated_at' },
          user_id: {
            _id: { $toString: '$user._id' },
            name: '$user.name',
            email: '$user.email',
            role: '$user.role',
            phone_number: '$user.phone_number',
            profile_picture: '$user.profile_picture',
            created_at: { $toString: '$user.created_at' },
            updated_at: { $toString: '$user.updated_at' }
          }
        }
      }
    ]).toArray();

    return {
      success: true,
      data: teacher[0],
      message: "Guru berhasil ditambahkan"
    };

  } catch (error: any) {
    console.error('Error creating teacher:', error);
    
    // Handle duplicate email
    if (error.code === 11000 && error.keyPattern?.email) {
      return {
        success: false,
        message: "Email sudah terdaftar"
      };
    }

    return {
      success: false,
      message: "Gagal menambahkan guru"
    };
  }
}

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

export async function getTeachers() {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    
    const teachers = await db.collection('teachers').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: { $toString: '$_id' },
          nip: 1,
          address: 1,
          created_at: { $toString: '$created_at' },
          updated_at: { $toString: '$updated_at' },
          user_id: {
            _id: { $toString: '$user._id' },
            name: '$user.name',
            email: '$user.email',
            role: '$user.role',
            phone_number: '$user.phone_number',
            profile_picture: '$user.profile_picture',
            created_at: { $toString: '$user.created_at' },
            updated_at: { $toString: '$user.updated_at' }
          }
        }
      }
    ]).toArray();

    return teachers;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw new Error('Failed to fetch teachers');
  }
}

export async function deleteTeacher(id: string) {
  try {
    const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
    
    // First get the teacher to get the user_id
    const teacher = await db.collection('teachers').findOne({
      _id: new ObjectId(id)
    });

    if (!teacher) {
      return {
        success: false,
        message: "Guru tidak ditemukan"
      };
    }

    // Delete the teacher
    await db.collection('teachers').deleteOne({
      _id: new ObjectId(id)
    });

    // Delete the associated user
    await db.collection('users').deleteOne({
      _id: teacher.user_id
    });

    return {
      success: true,
      message: "Guru berhasil dihapus"
    };

  } catch (error) {
    console.error('Error deleting teacher:', error);
    return {
      success: false,
      message: "Gagal menghapus guru"
    };
  }
}