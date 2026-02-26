import { NextResponse } from 'next/server';
import { getMongoClientInstance } from '@/db/config/connection';
import { hash } from 'bcrypt';

export async function GET() {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    const users = db.collection("users");
    const departments = db.collection("departments");

    // 1. Seed Admin HRD User
    const existingUser = await users.findOne({ email: "adminhrd@mail.com" });
    let userMessage = "User adminhrd already exists";

    if (!existingUser) {
      const hashedPassword = await hash("adminhrd123", 10);
      const newUser = {
        name: "Admin HRD",
        email: "adminhrd@mail.com",
        password: hashedPassword,
        role: "adminhrd",
        created_at: new Date(),
        updated_at: new Date(),
        phone_number: "",
        is_active: true,
      };
      await users.insertOne(newUser);
      userMessage = "User adminhrd created successfully";
    }

    // 2. Seed Departments including "Direksi"
    const defaultDepartments = [
      "Direksi",
      "Departemen Kepengasuhan",
      "Departemen Tahfizh",
      "Departemen Keuangan & Bisnis",
      "Departemen Sekolah Menengah & Litbang",
      "Departemen Sekolah Dasar",
      "Departemen Sekretariat",
      "Departemen Aset, Kerumahtanggaan & Infrastruktur",
    ];

    let deptCount = 0;
    for (const name of defaultDepartments) {
      const result = await departments.updateOne(
        { name },
        { $setOnInsert: { name } },
        { upsert: true }
      );
      if (result.upsertedCount > 0) deptCount++;
    }

    return NextResponse.json({ 
      message: "Seed completed", 
      user: userMessage,
      departmentsSeeded: deptCount 
    }, { status: 200 });
  } catch (error) {
    console.error("Error seeding:", error);
    return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
  }
}
