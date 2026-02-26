
const { MongoClient } = require("mongodb");
const { compare, hash } = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function verify() {
  const uri = process.env.MONGODB_CONNECTION_STRING;
  if (!uri) {
    console.error("MONGODB_CONNECTION_STRING not found");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to database");
    const db = client.db("pesantren_db");
    const users = db.collection("users");

    const email = "adminhrd@mail.com";
    const password = "adminhrd123";

    const user = await users.findOne({ email });

    if (!user) {
      console.log("User not found!");
    } else {
      console.log("User found:", user.email);
      console.log("Stored hash:", user.password);
      
      const isValid = await compare(password, user.password);
      console.log("Password valid:", isValid);

      if (!isValid) {
        console.log("Updating password...");
        const newHash = await hash(password, 10);
        await users.updateOne({ _id: user._id }, { $set: { password: newHash } });
        console.log("Password updated.");
        
        const isValidNow = await compare(password, newHash);
        console.log("Password valid now:", isValidNow);
      }
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

verify();
