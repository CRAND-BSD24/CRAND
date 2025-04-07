import { getServerSession } from "next-auth";
import { getMongoClientInstance } from "@/db/config/connection";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { password: 0 } } // Exclude password from response
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 