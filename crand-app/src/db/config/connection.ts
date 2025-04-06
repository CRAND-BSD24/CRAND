import { MongoClient } from "mongodb";
import { config } from "dotenv";
config();

const connectionString = process.env.MONGODB_CONNECTION_STRING;
// test INI
const dbName = "pesantren_db";

// Memastikan bahwa connectionString sudah ada value-nya
if (!connectionString) {
  throw new Error("MONGODB_CONNECTION_STRING is not defined");
}

// Tipe data dari client adalah MongoClient
let client: MongoClient;

// Fungsi ini akan mengembalikan client yang sudah terkoneksi dengan MongoDB
// Hanya boleh ada 1 instance client (Singleton)
export const getMongoClientInstance = async () => {
  if (!client) {
    client = await MongoClient.connect(connectionString);
    await client.connect();
  }

  //test INI

  return client;
};
