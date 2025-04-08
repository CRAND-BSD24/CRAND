import { NextResponse } from "next/server";
import { getMongoClientInstance } from "@/db/config/connection";

export async function GET() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const classes = await db.collection("classes").find({}).toArray();
    return NextResponse.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
} 