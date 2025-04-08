import { NextResponse } from "next/server";
import { getMongoClientInstance } from "@/db/config/connection";

export async function GET() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const students = await db.collection("students").find({}).toArray();
    const users = await db.collection("users").find({}).toArray();

    return NextResponse.json({
      students: students.map(s => ({
        _id: s._id.toString(),
        name: s.name,
        birth_date_place: s.birth_date_place
      })),
      users: users.map(u => ({
        _id: u._id.toString(),
        student_id: u.student_id?.toString(),
        email: u.email,
        phone_number: u.phone_number
      }))
    });
  } catch (error) {
    console.error("Error checking data:", error);
    return NextResponse.json(
      { error: "Failed to check data" },
      { status: 500 }
    );
  }
} 