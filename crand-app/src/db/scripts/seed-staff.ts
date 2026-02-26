
import { getMongoClientInstance } from "@/db/config/connection";
import { hash } from "bcrypt";

async function seedStaff() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const usersCollection = db.collection("users");

  const staffEmail = "staff@mail.com";
  
  // Check if staff exists
  const existingStaff = await usersCollection.findOne({ email: staffEmail });
  
  if (existingStaff) {
    console.log("Staff user already exists.");
  } else {
    const hashedPassword = await hash("staff123", 10);
    await usersCollection.insertOne({
      name: "Staff User",
      email: staffEmail,
      password: hashedPassword,
      role: "staff",
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log("Staff user created successfully.");
  }
  
  // Close connection (optional, depending on how connection is managed, 
  // but usually good for scripts. However, getMongoClientInstance reuses connection 
  // so we might not want to close it if other things are running, but for a standalone script it is fine)
  // Actually, getMongoClientInstance caches the client. 
  // We should manually close it here if we want the script to exit cleanly.
  await client.close();
}

seedStaff().catch(console.error);
