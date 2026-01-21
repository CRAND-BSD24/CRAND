"use server";
import { getMongoClientInstance } from "@/db/config/connection";

export async function getLeaveCategories() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const items = await db.collection("leave_categories").find({}).sort({ name: 1 }).toArray();
  return items.map((it: any) => ({ id: it._id?.toString(), name: it.name }));
}

export async function addLeaveCategory(name: string) {
  if (!name || !name.trim()) return { success: false, message: "Nama wajib diisi" };
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  await db.collection("leave_categories").updateOne(
    { name },
    { $setOnInsert: { name, created_at: new Date(), updated_at: new Date() } },
    { upsert: true }
  );
  return { success: true };
}