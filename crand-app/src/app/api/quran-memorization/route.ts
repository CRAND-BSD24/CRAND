import { NextResponse } from "next/server";
import { getMongoClientInstance } from "@/db/config/connection";

export async function GET() {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    const juzList = await db
      .collection("quran_memorization")
      .find({}, { projection: { _id: 1, name: 1 } })
      .toArray();

    return NextResponse.json(juzList);
  } catch (error) {
    console.error("Error fetching juz list:", error);
    return NextResponse.json(
      { error: "Failed to fetch juz list" },
      { status: 500 }
    );
  }
} 