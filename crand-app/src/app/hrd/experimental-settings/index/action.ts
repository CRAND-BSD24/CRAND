"use server";
import { getMongoClientInstance } from "@/db/config/connection";

export async function getExperimentalSettings() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const items = await db.collection("experimental_settings").find({}).sort({ key: 1 }).toArray();
  return items.map((it: any) => ({ id: it._id?.toString(), key: it.key, value: it.value || "" }));
}

export async function upsertExperimentalSetting(key: string, value: string) {
  if (!key || !key.trim()) return { success: false, message: "Key wajib diisi" };
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  await db.collection("experimental_settings").updateOne(
    { key },
    { $set: { key: key.trim(), value, updated_at: new Date() }, $setOnInsert: { created_at: new Date() } },
    { upsert: true }
  );
  return { success: true };
}