"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export interface TeacherFixedCutsFilters {
  branch?: string;
  department?: string;
  payroll_period?: string;
  query?: string;
}

export async function getFilterOptions() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const branchCol = db.collection("branch_offices");
  const branchDefaults = [
    "Pesantren Ibnu Syam 1",
    "Pesantren Ibnu Syam 2 Putra",
    "Pesantren Ibnu Syam 2 Putri",
    "Pesantren Ibnu Syam 5",
  ];
  const branchCount = await branchCol.countDocuments();
  if (branchCount === 0) {
    await branchCol.insertMany(branchDefaults.map((name) => ({ name })));
  }
  const branchRows = await branchCol.find({}).sort({ name: 1 }).toArray();
  const branches = branchRows.map((r: any) => r.name as string);

  const deptCol = db.collection("departments");
  const deptDefaults = [
    "Departemen Kepengasuhan",
    "Departemen Tahfizh",
    "Departemen Keuangan & Bisnis",
    "Departemen Sekolah Menengah & Litbang",
    "Departemen Sekolah Dasar",
    "Departemen Sekretariat",
    "Departemen Aset, Kerumahtanggaan & Infrastruktur",
  ];
  const deptCount = await deptCol.countDocuments();
  if (deptCount === 0) {
    await deptCol.insertMany(deptDefaults.map((name) => ({ name })));
  }
  const deptRows = await deptCol.find({}).sort({ name: 1 }).toArray();
  const departments = deptRows.map((r: any) => r.name as string);

  const periodCol = db.collection("payroll_periods");
  const periodDefaults = ["Jam", "Mingguan", "Bulanan"];
  const periodCount = await periodCol.countDocuments();
  if (periodCount === 0) {
    await periodCol.insertMany(periodDefaults.map((name) => ({ name })));
  }
  const periodRows = await periodCol.find({}).sort({ name: 1 }).toArray();
  const periods = periodRows.map((r: any) => r.name as string);

  return {
    branches,
    departments,
    payrollPeriods: periods,
  };
}

export async function searchTeacherFixedCuts(filters: TeacherFixedCutsFilters, page: number, pageSize: number) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const match: any = {};
  if (filters.branch) match.branch_office = filters.branch;
  if (filters.department) match.department = filters.department;
  if (filters.payroll_period) match.payroll_period = filters.payroll_period;

  const pipeline: any[] = [
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
  ];

  if (filters.query && filters.query.trim()) {
    const q = filters.query.trim();
    pipeline.push({
      $match: {
        $or: [
          { nip: { $regex: q, $options: "i" } },
          { "user.name": { $regex: q, $options: "i" } },
          { position: { $regex: q, $options: "i" } },
          { department: { $regex: q, $options: "i" } },
          { branch_office: { $regex: q, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({ $sort: { "user.name": 1 } });
  const skip = Math.max(0, (page - 1) * pageSize);
  pipeline.push({ $facet: { rows: [{ $skip: skip }, { $limit: pageSize }], total: [{ $count: "count" }] } });

  const result = await db.collection("teachers").aggregate(pipeline).toArray();
  const facet = result[0] || { rows: [], total: [] };
  const totalCount = facet.total[0]?.count || 0;

  const items = (facet.rows || []).map((doc: any) => ({
    _id: doc._id?.toString?.() || String(doc._id),
    nip: doc.nip || "",
    name: doc.user?.name || "",
    position: doc.position || "",
    branch_office: doc.branch_office || "",
    department: doc.department || "",
  }));

  return { items, totalCount };
}

export async function searchTeacherFixedCutsAll(filters: TeacherFixedCutsFilters) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const match: any = {};
  if (filters.branch) match.branch_office = filters.branch;
  if (filters.department) match.department = filters.department;
  if (filters.payroll_period) match.payroll_period = filters.payroll_period;

  const pipeline: any[] = [
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
  ];

  if (filters.query && filters.query.trim()) {
    const q = filters.query.trim();
    pipeline.push({
      $match: {
        $or: [
          { nip: { $regex: q, $options: "i" } },
          { "user.name": { $regex: q, $options: "i" } },
          { position: { $regex: q, $options: "i" } },
          { department: { $regex: q, $options: "i" } },
          { branch_office: { $regex: q, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({ $sort: { "user.name": 1 } });
  const docs = await db.collection("teachers").aggregate(pipeline).toArray();

  return docs.map((doc: any) => ({
    _id: doc._id?.toString?.() || String(doc._id),
    nip: doc.nip || "",
    name: doc.user?.name || "",
    position: doc.position || "",
    branch_office: doc.branch_office || "",
    department: doc.department || "",
  }));
}

// Simpan perubahan Potongan Tetap per NIP ke koleksi baru teacher_fixed_cuts
export async function bulkUpdateTeacherFixedCutsByNip(rows: { nip: string; amount: number }[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "hrd") {
    return { success: false, message: "Unauthorized" };
  }
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  await db.collection("teacher_fixed_cuts").createIndex({ teacher_id: 1 }, { unique: true });
  let updated = 0;
  for (const row of rows) {
    const teacher = await db.collection("teachers").findOne({ nip: row.nip });
    if (!teacher?._id) continue;
    await db.collection("teacher_fixed_cuts").updateOne(
      { teacher_id: teacher._id },
      {
        $set: {
          teacher_id: teacher._id,
          fixed_cut_amount: Number(row.amount || 0),
          updated_by: new ObjectId(session.user.id),
          updated_at: new Date(),
        },
        $setOnInsert: { created_at: new Date() },
      },
      { upsert: true }
    );
    updated += 1;
  }
  return { success: true, updated };
}