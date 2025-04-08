import { NextResponse } from "next/server";
import { getMongoClientInstance } from "@/db/config/connection";

export async function GET() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const halaqahs = await db.collection("halaqah").find({}).toArray();
    return NextResponse.json(halaqahs);
  } catch (error) {
    console.error("Error fetching halaqahs:", error);
    return NextResponse.json(
      { error: "Failed to fetch halaqahs" },
      { status: 500 }
    );
  }
} 