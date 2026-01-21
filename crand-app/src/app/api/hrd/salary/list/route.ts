import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'hrd') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '0', 10);
    const month = parseInt(searchParams.get('month') || '0', 10); // 1-12

    const now = new Date();
    const y = year > 0 ? year : now.getFullYear();
    const m = month > 0 ? month : now.getMonth() + 1; // JS month 0-11
    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));

    const client = await getMongoClientInstance();
    const db = client.db('pesantren_db');

    const pipeline = [
      // Join ke users untuk data nama/email guru
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      // Ambil gaji pokok terbaru dari teacher_salary
      {
        $lookup: {
          from: 'teacher_salary',
          let: { tid: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$teacher_id', '$$tid'] } } },
            { $sort: { updated_at: -1 } },
            { $limit: 1 }
          ],
          as: 'salaryDoc'
        }
      },
      {
        $addFields: {
          base_salary: { $ifNull: [{ $arrayElemAt: ['$salaryDoc.base_salary', 0] }, 0] }
        }
      },
      // Hitung total kehadiran bulan berjalan
      {
        $lookup: {
          from: 'attendance',
          let: { tid: '$_id', start: start, end: end },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$teacher_id', '$$tid'] },
                    { $eq: ['$type', 'teacher'] },
                    { $gte: ['$created_at', '$$start'] },
                    { $lt: ['$created_at', '$$end'] }
                  ]
                }
              }
            },
            { $count: 'count' }
          ],
          as: 'att'
        }
      },
      {
        $addFields: {
          attendance_count: { $ifNull: [{ $arrayElemAt: ['$att.count', 0] }, 0] }
        }
      },
      // Hitung total gaji
      {
        $addFields: {
          total_salary: { $add: ['$base_salary', { $multiply: ['$attendance_count', 10000] }] }
        }
      },
      {
        $project: {
          _id: { $toString: '$_id' },
          teacher_id: { $toString: '$_id' },
          name: '$user.name',
          email: '$user.email',
          base_salary: 1,
          attendance_count: 1,
          total_salary: 1
        }
      },
      { $sort: { name: 1 } }
    ];

    const items = await db.collection('teachers').aggregate(pipeline).toArray();

    return NextResponse.json({ year: y, month: m, items });
  } catch (e) {
    console.error('Error in HRD salary list:', e);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}