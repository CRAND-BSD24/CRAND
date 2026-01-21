"use server";
import { getMongoClientInstance } from "@/db/config/connection";

export async function getHolidays() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const items = await db.collection("holidays").find({}).sort({ date: 1 }).toArray();
  return items.map((it: any) => ({ id: it._id?.toString(), name: it.name, date: it.date }));
}

export async function addHoliday(name: string, dateStr: string) {
  if (!name || !name.trim()) return { success: false, message: "Nama wajib diisi" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { success: false, message: "Tanggal tidak valid" };
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  await db.collection("holidays").updateOne(
    { date: d },
    { $set: { name: name.trim(), date: d, updated_at: new Date() }, $setOnInsert: { created_at: new Date() } },
    { upsert: true }
  );
  return { success: true };
}