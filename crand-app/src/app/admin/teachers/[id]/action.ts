'use server';

import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";

export async function getTeacherById(id: string) {
  try {
    const { db } = await connectToDatabase();
    
    const teacher = await db.collection('teachers').aggregate([
      {
        $match: {
          _id: new ObjectId(id)
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
          _id: 1,
          nip: 1,
          address: 1,
          created_at: 1,
          updated_at: 1,
          user_id: {
            _id: '$user._id',
            name: '$user.name',
            email: '$user.email',
            role: '$user.role',
            phone_number: '$user.phone_number',
            profile_picture: '$user.profile_picture',
            created_at: '$user.created_at',
            updated_at: '$user.updated_at'
          }
        }
      }
    ]).toArray();

    if (!teacher || teacher.length === 0) {
      return null;
    }

    return teacher[0];
  } catch (error) {
    console.error('Error fetching teacher:', error);
    throw new Error('Failed to fetch teacher data');
  }
} 