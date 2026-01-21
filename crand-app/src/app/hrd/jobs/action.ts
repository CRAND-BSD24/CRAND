"use server";
import { getMongoClientInstance } from "@/db/config/connection";

export async function getJobs() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const items = await db.collection("jobs").find({}).sort({ name: 1 }).toArray();
  return items.map((it: any) => ({ id: it._id?.toString(), name: it.name }));
}

export async function addJob(name: string) {
  if (!name || !name.trim()) return { success: false, message: "Nama wajib diisi" };
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  await db.collection("jobs").updateOne(
    { name },
    { $setOnInsert: { name, created_at: new Date(), updated_at: new Date() } },
    { upsert: true }
  );
  return { success: true };
}