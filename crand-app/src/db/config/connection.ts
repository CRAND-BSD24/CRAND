import { MongoClient } from "mongodb";
import { config } from "dotenv";
config();

const connectionString = process.env.MONGODB_CONNECTION_STRING;
const dbName = "pesantren_db";

if (!connectionString) {
  throw new Error("MONGODB_CONNECTION_STRING is not defined");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(connectionString);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(connectionString);
  clientPromise = client.connect();
}

export async function getMongoClientInstance() {
  const client = await clientPromise;
  return client;
}
