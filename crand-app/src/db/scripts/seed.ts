'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import { hash } from "bcrypt";

async function seed() {
  try {
    console.log("Starting database seed...");
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    const usersCollection = db.collection("users");
    
    // Check if users already exist
    const userCount = await usersCollection.countDocuments();
    if (userCount > 0) {
      console.log("Users already exist, skipping seed");
      return { success: true, message: "Users already exist" };
    }
    
    // Create test users
    const users = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: await hash("password123", 10),
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Teacher User",
        email: "teacher@example.com",
        password: await hash("password123", 10),
        role: "teacher",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Student User",
        email: "student@example.com",
        password: await hash("password123", 10),
        role: "student",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    console.log("Inserting users into database...");
    const result = await usersCollection.insertMany(users);
    console.log(`Successfully created ${result.insertedCount} users`);
    
    // Verify users were created
    const createdUsers = await usersCollection.find({}).toArray();
    console.log("Created users:", createdUsers.map(u => ({ email: u.email, role: u.role })));
    
    return { 
      success: true, 
      message: "Seed completed successfully",
      count: result.insertedCount
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