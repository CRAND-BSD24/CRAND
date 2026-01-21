"use server";
import { getMongoClientInstance } from "@/db/config/connection";

export async function getLatePenaltyTiers() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const items = await db.collection("late_penalty_tiers").find({}).sort({ minutes: 1 }).toArray();
  return items.map((it: any) => ({ id: it._id?.toString(), minutes: it.minutes || 0, penalty: it.penalty || 0 }));
}

export async function addLatePenaltyTier(minutes: number, penalty: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return { success: false, message: "Menit tidak valid" };
  if (!Number.isFinite(penalty) || penalty < 0) return { success: false, message: "Denda tidak valid" };
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  await db.collection("late_penalty_tiers").updateOne(
    { minutes },
    { $set: { minutes, penalty, updated_at: new Date() }, $setOnInsert: { created_at: new Date() } },
    { upsert: true }
  );
  return { success: true };
}