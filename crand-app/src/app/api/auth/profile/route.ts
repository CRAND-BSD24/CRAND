import { getServerSession } from "next-auth";
import { getMongoClientInstance } from "@/db/config/connection";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
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

    // Fetch employee data (teacher, staff, manager, etc.) if exists to get additional details
    const employee = await db.collection("teachers").findOne({ user_id: user._id });

    // Merge data
    const profile = {
      ...user,
      address: employee?.address || user.address || "",
      // If employee exists, use start_work_date, otherwise use created_at as fallback
      start_work_date: employee?.start_work_date || user.created_at,
      // Add more fields if needed by Profile component in the future
      position: employee?.position || "",
      department: employee?.department || "",
      nip: employee?.nip || "",
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update fields in users collection
    const userUpdate: any = {};
    if (data.name) userUpdate.name = data.name;
    if (data.email) userUpdate.email = data.email;
    if (data.phone_number) userUpdate.phone_number = data.phone_number;
    if (data.profile_picture) userUpdate.profile_picture = data.profile_picture;

    // Check if employee record exists (teacher, staff, manager)
    const employee = await db.collection("teachers").findOne({ user_id: user._id });

    if (employee) {
      // Update teachers collection for address, photo, email, and nip to keep sync
      const employeeUpdate: any = {};
      if (data.address) employeeUpdate.address = data.address;
      if (data.profile_picture) employeeUpdate.photo_base64 = data.profile_picture;
      if (data.email) employeeUpdate.email = data.email;
      if (data.nip) employeeUpdate.nip = data.nip;
      
      if (Object.keys(employeeUpdate).length > 0) {
        await db.collection("teachers").updateOne(
          { _id: employee._id },
          { $set: employeeUpdate }
        );
      }
    } else {
      // If no employee record (e.g. admin, adminhrd), store address in users collection
      if (data.address) userUpdate.address = data.address;
    }

    if (Object.keys(userUpdate).length > 0) {
      userUpdate.updated_at = new Date();
      await db.collection("users").updateOne(
        { _id: user._id },
        { $set: userUpdate }
      );
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 