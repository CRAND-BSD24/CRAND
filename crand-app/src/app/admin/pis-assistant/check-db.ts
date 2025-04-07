'use server';

import { getMongoClientInstance } from "@/db/config/connection";

// This function is for debugging only
export async function checkDatabase() {
  try {
    const client = await getMongoClientInstance();
    
    // List all databases
    const dbList = await client.db().admin().listDatabases();
    console.log("Available databases:", dbList.databases.map(db => db.name));
    
    // Check pesantren_db
    const db = client.db("pesantren_db");
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("Collections in pesantren_db:", collections.map(c => c.name));
    
    // Check for teachers collection
    const hasTeachers = collections.some(c => c.name === "teachers");
    console.log("Has teachers collection:", hasTeachers);
    
    if (hasTeachers) {
      // Check teacher data
      const teachers = await db.collection("teachers").find({}).toArray();
      console.log(`Found ${teachers.length} teachers in teachers collection`);
      console.log("All teachers:", JSON.stringify(teachers, null, 2));
      
      // Check for Yusuf specifically
      const yusuf = teachers.find(t => 
        t.name && t.name.toLowerCase().includes("yusuf")
      );
      console.log("Found Yusuf?", !!yusuf);
      if (yusuf) {
        console.log("Yusuf data:", JSON.stringify(yusuf, null, 2));
      }
    }
    
    // Try other possible collections
    const collections2 = ["teacher", "user", "users", "staff"];
    for (const collName of collections2) {
      if (collections.some(c => c.name === collName)) {
        console.log(`Checking ${collName} collection`);
        const items = await db.collection(collName).find({}).toArray();
        console.log(`Found ${items.length} items in ${collName} collection`);
        
        if (items.length > 0) {
          // Look for Yusuf
          const yusuf = items.find(item => 
            item.name && item.name.toLowerCase().includes("yusuf")
          );
          
          if (yusuf) {
            console.log(`Found Yusuf in ${collName} collection:`, JSON.stringify(yusuf, null, 2));
          }
        }
      }
    }
    
    // Create result message
    return { success: true, message: "Database check completed" };
  } catch (error: any) {
    console.error("Database check error:", error);
    return { success: false, error: error.message };
  }
}

// Run immediately when imported
checkDatabase().then(result => {
  console.log("Database check result:", result);
}).catch(err => {
  console.error("Failed to run database check:", err);
}); 