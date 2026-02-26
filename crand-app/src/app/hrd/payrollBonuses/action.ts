"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export interface BonusFilters {
  unit?: string;
  branch?: string;
  department?: string;
  month?: string;
  year?: string;
  query?: string;
}

export async function getBonuses(filters: BonusFilters) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const pipeline: any[] = [];

  // Lookup teacher info
  pipeline.push({
    $lookup: {
      from: "teachers",
      localField: "teacher_id",
      foreignField: "_id",
      as: "teacher"
    }
  });
  pipeline.push({ $unwind: { path: "$teacher", preserveNullAndEmptyArrays: true } });

  // Lookup user info for name
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "teacher.user_id",
      foreignField: "_id",
      as: "user"
    }
  });
  pipeline.push({ $unwind: { path: "$user", preserveNullAndEmptyArrays: true } });

  const match: any = {};
  const andList: any[] = [];

  if (filters.branch && filters.branch !== 'all') {
    match["teacher.branch_office"] = filters.branch;
  }
  
  if (filters.department && filters.department !== 'all') {
    match["teacher.department"] = filters.department;
  }

  // Handle Unit Bisnis (PISMART, Laundry, Dapur) - checking in department or position
  if (filters.unit && filters.unit !== 'all') {
     andList.push({
        $or: [
           { "teacher.department": { $regex: filters.unit, $options: "i" } },
           { "teacher.position": { $regex: filters.unit, $options: "i" } }
        ]
     });
  }

  if (filters.query && filters.query.trim()) {
    const q = filters.query.trim();
    andList.push({
        $or: [
        { "teacher.nip": { $regex: q, $options: "i" } },
        { "user.name": { $regex: q, $options: "i" } }
        ]
    });
  }

  if (andList.length > 0) {
    match["$and"] = andList;
  }

  // Date filtering
  if (filters.year) {
     const y = filters.year;
     if (filters.month) {
        const m = filters.month.padStart(2, '0');
        match["date"] = { $regex: `^${y}-${m}` };
     } else {
        match["date"] = { $regex: `^${y}` };
     }
  }

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  // Project necessary fields
  pipeline.push({
    $project: {
      _id: { $toString: "$_id" },
      nip: { $ifNull: ["$teacher.nip", "-"] },
      name: { $ifNull: ["$user.name", "Unknown"] },
      date: 1, // "YYYY-MM-DD"
      total: 1,
      bank: { $ifNull: ["$teacher.bank_name", "-"] },
      rekening: { $ifNull: ["$teacher.bank_account_number", "-"] },
      pph21: { $ifNull: ["$pph21", 0] },
      status: { $ifNull: ["$status", "draft"] }
    }
  });

  const results = await db.collection("teacher_bonuses").aggregate(pipeline).toArray();
  return results;
}

export async function seedBonuses() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  
  // Get all teachers
  const teachers = await db.collection("teachers").find({}).toArray();
  
  if (teachers.length === 0) {
    return { success: false, message: "No teachers found to seed bonuses for." };
  }

  const bonusesToInsert = [];
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  for (const teacher of teachers) {
    // Check if bonus already exists for this teacher this month (simple check)
    // For now, just insert a dummy one if we want to force seed
    // Let's create a bonus for current month
    
    bonusesToInsert.push({
      teacher_id: teacher._id,
      date: currentDate,
      total: 1000000 + Math.floor(Math.random() * 500000), // Random amount 1.0m - 1.5m
      pph21: 50000,
      status: "draft",
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  if (bonusesToInsert.length > 0) {
    // Clear existing to avoid duplicates during dev testing if needed, or just insert
    // For safety, let's just insert.
    await db.collection("teacher_bonuses").insertMany(bonusesToInsert);
    return { success: true, count: bonusesToInsert.length, message: `Successfully seeded ${bonusesToInsert.length} bonuses.` };
  }
  
  return { success: false, message: "No bonuses to insert." };
}

export async function sendSlipsToAll(filters: BonusFilters) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  // Re-use logic to find matching IDs or just update based on same criteria
  // For simplicity/efficiency, we can use the same match criteria to updateMany
  // But aggregate pipeline is complex with lookups. 
  // Easier to first fetch IDs using getBonuses logic (or simplified version) then update.
  // OR: if we trust filters map directly to teacher properties, we can do an update with pipeline or lookup? No, updateMany doesn't support pipeline with lookup easily.
  // Best approach: Find the IDs of the bonuses that match the filter, then update them.

  // Let's use getBonuses to get the IDs.
  const bonuses = await getBonuses(filters);
  const ids = bonuses.map(b => new ObjectId(b._id));

  if (ids.length === 0) {
    return { success: false, message: "Tidak ada data bonus yang ditemukan untuk dikirim." };
  }

  await db.collection("teacher_bonuses").updateMany(
    { _id: { $in: ids } },
    { $set: { status: "sent", updated_at: new Date() } }
  );

  return { success: true, message: `Berhasil mengirim ${ids.length} slip gaji.` };
}
