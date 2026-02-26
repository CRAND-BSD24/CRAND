"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";
import { getBaseSalaryForPosition } from "@/app/hrd/salaries/action";

export interface PayrollItem {
  id: string;
  teacherId: string;
  name: string;
  role: string;
  position: string;
  attendanceCount: number;
  bisyarohPokok: number;
  kehadiran: number;
  tunjJabatan: number;
  tunjFungsional: number;
  tunjKeluarga: number;
  tunjAsrama: number;
  tunjMakanLaundry: number;
  lainLain: number;
  totalPendapatan: number;
  potTunjKeluarga: number;
  potTunjAsrama: number;
  potTunjMakanLaundry: number;
  potLainLain: number;
  totalPotongan: number;
  netBisyaroh: number;
}

export async function getPayrollReport(month: number, year: number): Promise<PayrollItem[]> {
  const client = await getMongoClientInstance();
  const dbPesantren = client.db("pesantren_db");

  // Calculate period
  // Periode slip: 26 bulan sebelumnya s/d 25 bulan berjalan (end exclusive 26 bulan berjalan)
  // Example: Payroll for May (5). Period: April 26 - May 25.
  const periodStart = new Date(Date.UTC(year, month - 2, 26, 0, 0, 0));
  const periodEndExclusive = new Date(Date.UTC(year, month - 1, 26, 0, 0, 0));

  // Fetch overrides for this period (saved from manual edits in UI)
  const overrideDocs = await dbPesantren
    .collection("payroll_overrides")
    .find({ month, year })
    .toArray();
  const overrideMap = new Map<string, any>();
  for (const doc of overrideDocs) {
    const key = (doc.teacher_id as ObjectId)?.toString?.() || String(doc.teacher_id);
    overrideMap.set(key, doc);
  }

  // Fetch all teachers with linked user (for name & role), align with /admin
  const teachers = await dbPesantren
    .collection("teachers")
    .aggregate([
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
        $match: {
          "user.name": { $ne: null },
          "user.role": { $ne: null },
        },
      },
      { $sort: { "user.name": 1 } },
    ])
    .toArray();

  const teacherIds = teachers.map((t: any) => t._id as ObjectId);

  const teacherAttendanceAgg = await dbPesantren
    .collection("attendance")
    .aggregate([
      {
        $match: {
          teacher_id: { $in: teacherIds },
          type: "teacher",
          created_at: {
            $gte: periodStart,
            $lt: periodEndExclusive,
          },
        },
      },
      {
        $group: {
          _id: "$teacher_id",
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const teacherAttendanceMap = new Map<string, number>();
  for (const row of teacherAttendanceAgg) {
    teacherAttendanceMap.set((row._id as ObjectId).toString(), Number(row.count || 0));
  }

  const adminUserIds: ObjectId[] = [];
  for (const t of teachers) {
    if (t.user?.role === "admin" && t.user?._id) {
      adminUserIds.push(t.user._id as ObjectId);
    }
  }

  let adminAttendanceMap = new Map<string, number>();
  if (adminUserIds.length > 0) {
    const adminAttendanceAgg = await dbPesantren
      .collection("admin_attendance")
      .aggregate([
        {
          $match: {
            admin_id: { $in: adminUserIds },
            created_at: {
              $gte: periodStart,
              $lt: periodEndExclusive,
            },
          },
        },
        {
          $group: {
            _id: "$admin_id",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    adminAttendanceMap = new Map<string, number>();
    for (const row of adminAttendanceAgg) {
      adminAttendanceMap.set((row._id as ObjectId).toString(), Number(row.count || 0));
    }
  }

  const salaryDocs = await dbPesantren
    .collection("teacher_salary")
    .aggregate([
      {
        $match: {
          teacher_id: { $in: teacherIds },
        },
      },
      {
        $sort: {
          teacher_id: 1,
          updated_at: -1,
        },
      },
      {
        $group: {
          _id: "$teacher_id",
          base_salary: { $first: "$base_salary" },
        },
      },
    ])
    .toArray();

  const salaryMap = new Map<string, number>();
  for (const row of salaryDocs) {
    salaryMap.set((row._id as ObjectId).toString(), Number(row.base_salary || 0));
  }

  const positions = Array.from(
    new Set(
      teachers
        .map((t: any) => String(t.position || "").trim())
        .filter((p: string) => p.length > 0)
    )
  );

  const positionSalaryMap = new Map<string, number>();
  for (const pos of positions) {
    const amount = await getBaseSalaryForPosition(pos);
    positionSalaryMap.set(pos, Number(amount || 0));
  }

  const results: PayrollItem[] = [];

  for (const teacher of teachers) {
    const teacherId = teacher._id as ObjectId;
    const name = teacher.user?.name || teacher.nip || "Unknown";
    const position = teacher.position || "-";
    const role = teacher.user?.role || "teacher";

    const teacherKey = teacherId.toString();

    const salaryFromMap = salaryMap.get(teacherKey) || 0;
    let bisyarohPokok = salaryFromMap;

    let attendanceCount = 0;
    if (role === "admin") {
      const adminKey = (teacher.user?._id as ObjectId)?.toString?.() || "";
      attendanceCount = adminAttendanceMap.get(adminKey) || 0;
    } else {
      attendanceCount = teacherAttendanceMap.get(teacherKey) || 0;
    }

    let ratePerAttendance = 0;
    if (role === "teacher") {
      ratePerAttendance = 10000;
    } else if (
      role === "staff" ||
      role === "admin" ||
      role === "kepengasuhan"
    ) {
      ratePerAttendance = 35000;
    } else {
      ratePerAttendance = 0;
    }

    let kehadiran =
      role === "educator" ? 0 : attendanceCount * ratePerAttendance;

    let lainLain = 0;

    // Apply overrides if any for this teacher and period
    const override = overrideMap.get(teacherId.toString());
    if (override) {
      if (typeof override.bisyarohPokok === "number") {
        bisyarohPokok = Number(override.bisyarohPokok || 0);
      }
      if (typeof override.kehadiran === "number") {
        kehadiran = Number(override.kehadiran || 0);
      }
      if (typeof override.lainLain === "number") {
        lainLain = Number(override.lainLain || 0);
      }
    }

    const tunjJabatan = positionSalaryMap.get(position.trim()) || 0;
    const tunjFungsional = 0;
    const tunjKeluarga = 0;
    const tunjAsrama = 300000;
    const tunjMakanLaundry = 750000;

    const totalPendapatan =
      bisyarohPokok +
      kehadiran +
      tunjJabatan +
      tunjFungsional +
      tunjKeluarga +
      tunjAsrama +
      tunjMakanLaundry +
      lainLain;

    // 4. Deductions
    const potTunjKeluarga = 0;
    const potTunjAsrama = tunjAsrama;
    const potTunjMakanLaundry = tunjMakanLaundry;
    const potLainLain = 0;

    const totalPotongan =
      potTunjKeluarga +
      potTunjAsrama +
      potTunjMakanLaundry +
      potLainLain;

    const netBisyaroh = totalPendapatan - totalPotongan;

    results.push({
      id: teacherId.toString(),
      teacherId: teacherId.toString(),
      name,
      role,
      position,
      attendanceCount,
      bisyarohPokok,
      kehadiran,
      tunjJabatan,
      tunjFungsional,
      tunjKeluarga,
      tunjAsrama,
      tunjMakanLaundry,
      lainLain,
      totalPendapatan,
      potTunjKeluarga,
      potTunjAsrama,
      potTunjMakanLaundry,
      potLainLain,
      totalPotongan,
      netBisyaroh,
    });
  }

  return results;
}

export async function savePayrollOverrides(
  month: number,
  year: number,
  overrides: {
    teacherId: string;
    bisyarohPokok?: number;
    kehadiran?: number;
    lainLain?: number;
  }[]
) {
  const client = await getMongoClientInstance();
  const dbPesantren = client.db("pesantren_db");
  const col = dbPesantren.collection("payroll_overrides");

  for (const it of overrides) {
    const update: any = {};
    if (typeof it.bisyarohPokok === "number") {
      update.bisyarohPokok = Number(it.bisyarohPokok || 0);
    }
    if (typeof it.kehadiran === "number") {
      update.kehadiran = Number(it.kehadiran || 0);
    }
     if (typeof it.lainLain === "number") {
       update.lainLain = Number(it.lainLain || 0);
     }
    if (Object.keys(update).length === 0) continue;

    await col.updateOne(
      {
        teacher_id: new ObjectId(it.teacherId),
        month,
        year,
      },
      {
        $set: {
          ...update,
          updated_at: new Date(),
        },
      },
      { upsert: true }
    );
  }

  return { success: true };
}

export async function sendSalarySlipsToAll(month: number, year: number) {
  const client = await getMongoClientInstance();
  const dbPesantren = client.db("pesantren_db");

  const items = await getPayrollReport(month, year);
  if (!items || items.length === 0) {
    return { success: false, message: "Tidak ada data payroll untuk dikirim." };
  }

  const monthsId = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const slipDate = new Date(Date.UTC(year, month - 1, 25, 0, 0, 0));
  const isoDate = slipDate.toISOString().split("T")[0];

  const bulkOps = items.map((item) => {
    const teacherObjectId = new ObjectId(item.teacherId);

    const incomeDetails = [
      { name: "Bisyaroh Pokok", amount: item.bisyarohPokok },
      { name: "Kehadiran", amount: item.kehadiran },
      { name: "Tunj. Jabatan", amount: item.tunjJabatan },
      { name: "Tunj. Fungsional", amount: item.tunjFungsional },
      { name: "Tunj. Keluarga", amount: item.tunjKeluarga },
      { name: "Tunj. Asrama", amount: item.tunjAsrama },
      { name: "Tunj. Makan & Laundry", amount: item.tunjMakanLaundry },
      { name: "Lain-lain", amount: item.lainLain },
    ];

    const deductionDetails = [
      { name: "Pot. Tunj. Keluarga", amount: item.potTunjKeluarga },
      { name: "Pot. Tunj. Asrama", amount: item.potTunjAsrama },
      { name: "Pot. Tunj. Makan & Laundry", amount: item.potTunjMakanLaundry },
      { name: "Potongan Lain-lain", amount: item.potLainLain },
    ];

    return {
      updateOne: {
        filter: {
          teacher_id: teacherObjectId,
          date: isoDate,
          type: "payroll",
        },
        update: {
          $set: {
            total: item.netBisyaroh,
            pph21: 0,
            status: "sent",
            income_details: incomeDetails,
            deduction_details: deductionDetails,
            type: "payroll",
            updated_at: new Date(),
          },
          $setOnInsert: {
            created_at: new Date(),
          },
        },
        upsert: true,
      },
    };
  });

  if (bulkOps.length === 0) {
    return { success: false, message: "Tidak ada data payroll untuk dikirim." };
  }

  await dbPesantren.collection("teacher_bonuses").bulkWrite(bulkOps);

  const monthName = monthsId[(month - 1 + 12) % 12] || String(month);
  return {
    success: true,
    message: `Berhasil mengirim slip gaji untuk periode ${monthName} ${year}.`,
  };
}
