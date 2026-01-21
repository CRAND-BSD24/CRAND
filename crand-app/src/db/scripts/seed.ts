'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import { hash } from "bcrypt";
import { ObjectId } from "mongodb";

async function seed() {
  try {
    console.log("Starting database seed...");
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    const usersCollection = db.collection("users");
    
    // Ensure default student user exists (idempotent)
    const existingStudent = await usersCollection.findOne({ email: { $regex: /^student@mail.com$/i } });
    if (!existingStudent) {
      await usersCollection.insertOne({
        name: "Student User",
        email: "student@mail.com",
        password: await hash("password123", 10),
        role: "student",
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log("Seeded default student user");
    }

    // Upsert educator user
    const educatorEmail = "educator@mail.com";
    const educator = await usersCollection.findOne({ email: { $regex: /^educator@mail.com$/i } });
    let educatorUserId: ObjectId | null = educator?._id || null;
    const educatorHashed = await hash("educator123", 10);

    if (!educator) {
      const insert = await usersCollection.insertOne({
        name: "educator",
        email: educatorEmail,
        password: educatorHashed,
        role: "educator",
        phone_number: "",
        profile_picture: "",
        created_at: new Date(),
        updated_at: new Date(),
      });
      educatorUserId = insert.insertedId;
      console.log("Seeded educator user");
    } else {
      // Keep id, ensure role and password are correct
      await usersCollection.updateOne(
        { _id: educator._id },
        {
          $set: {
            role: "educator",
            password: educatorHashed,
            name: educator.name || "educator",
            updated_at: new Date(),
          },
          $setOnInsert: { created_at: new Date() },
        },
        { upsert: true }
      );
      educatorUserId = educator._id as ObjectId;
      console.log("Updated educator user");
    }

    // Ensure educator has a teacher record so teacher-like pages work
    if (educatorUserId) {
      const teachersCollection = db.collection("teachers");
      const existingTeacherForEducator = await teachersCollection.findOne({ user_id: educatorUserId });
      if (!existingTeacherForEducator) {
        await teachersCollection.insertOne({
          user_id: educatorUserId,
          nip: "EDU-0001",
          address: "",
          created_at: new Date(),
          updated_at: new Date(),
        });
        console.log("Created teacher record for educator");
      }
    }

    return {
      success: true,
      message: "Seed completed successfully",
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { 
      success: false, 
      message: "Error seeding database",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export { seed };