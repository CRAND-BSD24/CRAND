const { MongoClient } = require("mongodb");
const { hash } = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function seed() {
  const uri = process.env.MONGODB_CONNECTION_STRING;
  if (!uri) {
    console.error("MONGODB_CONNECTION_STRING not found in env");
    console.error("Please make sure .env file exists in project root");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to database");
    const db = client.db("pesantren_db");
    const users = db.collection("users");
    const departments = db.collection("departments");

    // 1. Seed Admin HRD User
    const email = "adminhrd@mail.com";
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      console.log("User adminhrd already exists");
    } else {
      const hashedPassword = await hash("adminhrd123", 10);
      const newUser = {
        name: "Admin HRD",
        email,
        password: hashedPassword,
        role: "adminhrd",
        created_at: new Date(),
        updated_at: new Date(),
        phone_number: "",
        is_active: true,
      };
      await users.insertOne(newUser);
      console.log("User adminhrd created successfully");
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
    console.log(`Seeded ${deptCount} new departments`);
    
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await client.close();
  }
}

seed();
