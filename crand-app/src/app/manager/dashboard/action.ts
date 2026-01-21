"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

interface ManagerWeeklyDashboardData {
  weeks: { label: string; start: string; end: string }[];
  teacherAttendancePct: number[]; // per minggu, persen hadir
  studentsMin5Count: number[]; // jumlah santri dengan >=5 halaman per minggu
  thisWeek: {
    attendancePct: number;
    studentsMin5Count: number;
  };
}

function getWeekStartEnd(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function countWorkingDays(start: Date, end: Date) {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day >= 1 && day <= 5) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export async function getManagerWeeklyDashboardData(): Promise<ManagerWeeklyDashboardData> {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const now = new Date();
  const weeks: { start: Date; end: Date; label: string }[] = Array.from({ length: 4 }).map((_, i) => {
    const ref = new Date(now);
    ref.setDate(ref.getDate() - i * 7);
    const { start, end } = getWeekStartEnd(ref);
    const label = `${start.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} - ${end.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}`;
    return { start, end, label };
  });

  // Total ustadz (gunakan koleksi teachers)
  const totalTeachers = await db.collection("teachers").countDocuments();

  const teacherAttendancePct: number[] = [];
  const studentsMin5Count: number[] = [];

  for (const w of weeks) {
    const workingDays = countWorkingDays(w.start, w.end);

    // Kehadiran ustadz: status Present per minggu
    const presentCount = await db.collection("teacher_attendance").countDocuments({
      date: { $gte: w.start, $lte: w.end },
      status: "Present",
    });
    const attendancePct = totalTeachers > 0 && workingDays > 0
      ? (presentCount / (totalTeachers * workingDays)) * 100
      : 0;
    teacherAttendancePct.push(Number(attendancePct.toFixed(1)));

    // Hafalan santri >= 5 halaman per minggu
    const agg = await db.collection("memorization_grades").aggregate([
      { $match: { created_at: { $gte: w.start, $lte: w.end } } },
      { $addFields: { pages_int: { $convert: { input: "$pages", to: "int", onError: 0, onNull: 0 } } } },
      { $group: { _id: "$student_id", totalPages: { $sum: "$pages_int" } } },
      { $match: { totalPages: { $gte: 5 } } },
      { $count: "count" },
    ]).toArray();
    const count = agg[0]?.count ?? 0;
    studentsMin5Count.push(count);
  }

  return {
    weeks: weeks.map((w) => ({ label: w.label, start: w.start.toISOString(), end: w.end.toISOString() })),
    teacherAttendancePct: teacherAttendancePct.reverse(),
    studentsMin5Count: studentsMin5Count.reverse(),
    thisWeek: {
      attendancePct: teacherAttendancePct[0] ?? 0,
      studentsMin5Count: studentsMin5Count[0] ?? 0,
    },
  };
}