import { NextResponse } from "next/server";
import { getMongoClientInstance } from "@/db/config/connection";

export async function GET() {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    
    // Pastikan kita mengambil semua field yang diperlukan
    const halaqahs = await db.collection("halaqah")
      .find({}, { projection: { _id: 1, name: 1 } })
      .toArray();
    
    // Pastikan data yang dikembalikan memiliki format yang benar
    const formattedHalaqahs = halaqahs.map(halaqah => ({
      _id: halaqah._id.toString(), // Konversi ObjectId ke string
      name: halaqah.name
    }));
    
    return NextResponse.json(formattedHalaqahs);
  } catch (error) {
    console.error("Error fetching halaqahs:", error);
    return NextResponse.json(
      { error: "Failed to fetch halaqahs" },
      { status: 500 }
    );
  }
} 