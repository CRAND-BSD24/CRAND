"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface TeacherSalaryFilters {
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

export async function searchTeacherSalaries(filters: TeacherSalaryFilters, page: number, pageSize: number) {
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
    {
      $lookup: {
        from: "teacher_salary",
        localField: "_id",
        foreignField: "teacher_id",
        as: "salary",
      },
    },
    {
      $lookup: {
        from: "position_base_salaries",
        localField: "position",
        foreignField: "position",
        as: "position_entries",
      },
    },
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

  const computeYears = (start: any) => {
    try {
      if (!start) return 0;
      const d = new Date(String(start));
      if (isNaN(d.getTime())) return 0;
      const now = new Date();
      let years = now.getFullYear() - d.getFullYear();
      const mDiff = now.getMonth() - d.getMonth();
      if (mDiff < 0 || (mDiff === 0 && now.getDate() < d.getDate())) years -= 1;
      return Math.max(0, years);
    } catch {
      return 0;
    }
  };

  const pickAmount = (entries: any[], years: number) => {
    if (!Array.isArray(entries) || entries.length === 0) return 0;
    const arr = entries
      .map((e) => ({ y: Number(e.years_of_service || 0), a: Number(e.amount || 0) }))
      .sort((a, b) => a.y - b.y);
    let chosen = 0;
    for (const e of arr) {
      if (years >= e.y) chosen = e.a;
      else break;
    }
    return chosen;
  };

  const items = (facet.rows || []).map((doc: any) => {
    const override = Number((doc.salary?.[0]?.base_salary) ?? 0);
    const years = computeYears(doc.start_work_date);
    const matrixAmount = pickAmount(doc.position_entries || [], years);
    const type = String(doc.payroll_type || "");
    let base = matrixAmount;
    if (type === "Diatur Sendiri") {
      base = override > 0 ? override : 0;
    } else if (type === "Sesuai Jabatan/Grade") {
      base = matrixAmount;
    } else {
      base = matrixAmount;
    }
    return {
      _id: doc._id?.toString?.() || String(doc._id),
      nip: doc.nip || "",
      name: doc.user?.name || "",
      position: doc.position || "",
      branch_office: doc.branch_office || "",
      department: doc.department || "",
      base_salary: Number(base || 0),
      payroll_type: String(doc.payroll_type || ""),
    };
  });

  return { items, totalCount };
}

export async function searchTeacherSalariesAll(filters: TeacherSalaryFilters) {
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
    {
      $lookup: {
        from: "teacher_salary",
        localField: "_id",
        foreignField: "teacher_id",
        as: "salary",
      },
    },
    {
      $lookup: {
        from: "position_base_salaries",
        localField: "position",
        foreignField: "position",
        as: "position_entries",
      },
    },
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

  const computeYears = (start: any) => {
    try {
      if (!start) return 0;
      const d = new Date(String(start));
      if (isNaN(d.getTime())) return 0;
      const now = new Date();
      let years = now.getFullYear() - d.getFullYear();
      const mDiff = now.getMonth() - d.getMonth();
      if (mDiff < 0 || (mDiff === 0 && now.getDate() < d.getDate())) years -= 1;
      return Math.max(0, years);
    } catch {
      return 0;
    }
  };

  const pickAmount = (entries: any[], years: number) => {
    if (!Array.isArray(entries) || entries.length === 0) return 0;
    const arr = entries
      .map((e) => ({ y: Number(e.years_of_service || 0), a: Number(e.amount || 0) }))
      .sort((a, b) => a.y - b.y);
    let chosen = 0;
    for (const e of arr) {
      if (years >= e.y) chosen = e.a;
      else break;
    }
    return chosen;
  };

  return docs.map((doc: any) => {
    const override = Number((doc.salary?.[0]?.base_salary) ?? 0);
    const years = computeYears(doc.start_work_date);
    const matrixAmount = pickAmount(doc.position_entries || [], years);
    const type = String(doc.payroll_type || "");
    let base = matrixAmount;
    if (type === "Diatur Sendiri") {
      base = override > 0 ? override : 0;
    } else if (type === "Sesuai Jabatan/Grade") {
      base = matrixAmount;
    } else {
      base = matrixAmount;
    }
    return {
      _id: doc._id?.toString?.() || String(doc._id),
      nip: doc.nip || "",
      name: doc.user?.name || "",
      position: doc.position || "",
      branch_office: doc.branch_office || "",
      department: doc.department || "",
      base_salary: Number(base || 0),
      payroll_type: String(doc.payroll_type || ""),
    };
  });
}

export async function bulkUpdateTeacherBaseSalaryByNip(rows: { nip: string; amount: number }[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "hrd") {
    return { success: false, message: "Unauthorized" };
  }
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  let updated = 0;
  for (const row of rows) {
    const teacher = await db.collection("teachers").findOne({ nip: row.nip });
    if (!teacher?._id) continue;
    await db.collection("teacher_salary").updateOne(
      { teacher_id: teacher._id },
      {
        $set: {
          teacher_id: teacher._id,
          base_salary: Number(row.amount || 0),
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

export async function bulkUpdateTeacherPositionByNip(rows: { nip: string; name?: string; position: string }[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "hrd") {
    return { success: false, message: "Unauthorized" };
  }
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const normalizeKey = (s: string) => String(s || "").toLowerCase().replace(/[^a-zA-Z0-9]+/g, " ").trim().replace(/\s{2,}/g, " ");
  const allPositions = await db.collection("job_positions").find({}).toArray();
  const posMap = new Map<string, string>();
  for (const p of allPositions) {
    const name = String(p.name || "");
    posMap.set(normalizeKey(name), name);
  }

  let updated = 0;
  for (const row of rows) {
    const nip = String(row.nip || "").trim();
    const rawPos = String(row.position || "").trim();
    if (!nip || !rawPos) continue;
    const canonical = posMap.get(normalizeKey(rawPos)) || rawPos;
    const res = await db.collection("teachers").updateOne(
      { nip },
      { $set: { position: canonical, updated_at: new Date() } }
    );
    if (res.modifiedCount > 0) updated += 1;
  }

  return { success: true, updated };
}