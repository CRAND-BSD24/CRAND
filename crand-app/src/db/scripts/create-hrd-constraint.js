const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function run() {
  const uri = process.env.MONGODB_CONNECTION_STRING;
  if (!uri) {
    console.error("MONGODB_CONNECTION_STRING not found");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("pesantren_db");
    const users = db.collection("users");

    // Create unique index for role 'hrd'
    // Using partial filter expression to only apply uniqueness when role is 'hrd'
    console.log("Creating unique index for role 'hrd'...");
    const result = await users.createIndex(
      { role: 1 },
      { 
        unique: true, 
        partialFilterExpression: { role: "hrd" },
        name: "unique_hrd_role"
      }
    );

    console.log("Index created:", result);
  } catch (error) {
    console.error("Error creating index:", error);
  } finally {
    await client.close();
  }
}

run();
