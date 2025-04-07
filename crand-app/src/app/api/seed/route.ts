import { NextResponse } from "next/server";
import { seed } from "@/db/scripts/seed";

export async function GET() {
  try {
    const result = await seed();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error executing seed:", error);
    return NextResponse.json(
      { success: false, message: "Error executing seed" },
      { status: 500 }
    );
  }
} 