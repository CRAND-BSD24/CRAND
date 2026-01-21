"use server";
import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export interface FixedAllowanceItem {
  id?: string;
  name: string;
  priority: number;
  type: "Harian" | "Bulanan";
  apply_at: "Check In" | "Check Out";
}

export async function searchFixedAllowances(query: string, page: number, pageSize: number) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const match: any = {};
  if (query && query.trim()) match.name = { $regex: query.trim(), $options: "i" };
  const pipeline: any[] = [{ $match: match }, { $sort: { priority: 1, name: 1 } }, { $facet: { rows: [{ $skip: Math.max(0, (page - 1) * pageSize) }, { $limit: pageSize }], total: [{ $count: "count" }] } }];
  const result = await db.collection("fixed_allowances").aggregate(pipeline).toArray();
  const facet = result[0] || { rows: [], total: [] };
  const items = (facet.rows || []).map((it: any) => ({ id: it._id?.toString(), name: it.name, priority: Number(it.priority || 0), type: String(it.type || "Harian"), apply_at: String(it.apply_at || "Check In") }));
  const totalCount = facet.total[0]?.count || 0;
  return { items, totalCount };
}

export async function getFixedAllowancesAll(query?: string) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const match: any = {};
  if (query && query.trim()) match.name = { $regex: query.trim(), $options: "i" };
  const rows = await db.collection("fixed_allowances").find(match).sort({ priority: 1, name: 1 }).toArray();
  return rows.map((it: any) => ({ id: it._id?.toString(), name: it.name, priority: Number(it.priority || 0), type: String(it.type || "Harian"), apply_at: String(it.apply_at || "Check In") }));
}

export async function createFixedAllowance(data: { name: string; priority: number; type: string; apply_at: string }) {
  const name = (data.name || "").trim();
  const priority = Number(data.priority);
  const type = data.type === "Bulanan" ? "Bulanan" : "Harian";
  const apply_at = data.apply_at === "Check Out" ? "Check Out" : "Check In";
  if (!name) return { success: false, message: "Nama wajib diisi" };
  if (!Number.isFinite(priority)) return { success: false, message: "Prioritas tidak valid" };
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  await db.collection("fixed_allowances").createIndex({ name: 1 }, { unique: true });
  await db.collection("fixed_allowances").updateOne(
    { name },
    { $set: { name, priority, type, apply_at, updated_at: new Date() }, $setOnInsert: { created_at: new Date() } },
    { upsert: true }
  );
  return { success: true };
}

export async function getFixedAllowanceById(id: string) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  if (!ObjectId.isValid(id)) return null;
  const row = await db.collection("fixed_allowances").findOne({ _id: new ObjectId(id) });
  if (!row) return null;
  return {
    id: row._id?.toString(),
    name: String(row.name || ""),
    priority: Number(row.priority || 0),
    type: String(row.type || "Harian"),
    apply_at: String(row.apply_at || "Check In"),
  };
}