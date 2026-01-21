import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'hrd') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const teacherId = body.teacherId as string;
    const baseSalary = Number(body.baseSalary);

    if (!teacherId || Number.isNaN(baseSalary) || baseSalary < 0) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    const client = await getMongoClientInstance();
    const db = client.db('pesantren_db');
    const teacherObjectId = new ObjectId(teacherId);

    const teacher = await db.collection('teachers').findOne({ _id: teacherObjectId });
    if (!teacher) {
      return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
    }

    await db.collection('teacher_salary').updateOne(
      { teacher_id: teacherObjectId },
      {
        $set: {
          teacher_id: teacherObjectId,
          base_salary: baseSalary,
          updated_by: new ObjectId(session.user.id),
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ message: 'Base salary updated' });
  } catch (e) {
    console.error('Error in HRD salary update:', e);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}