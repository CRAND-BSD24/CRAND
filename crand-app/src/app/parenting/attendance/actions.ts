"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getCurrentShift, isValidAttendanceTime, SHIFT_SCHEDULES, SHIFT_TIMES, getSchedulesByRole, getTimeLabelsByRole, Role } from "@/lib/shift-utils";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface AttendanceData {
  student_id: string;
  date: Date;
  status: "Present" | "Sick" | "Permission" | "Absent";
  role?: "teacher" | "educator";
  is_late?: boolean;
  late_minutes?: number;
}

export async function createAttendance(data: AttendanceData) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const now = new Date();
    const role = (data.role || "teacher") as Role;
    const BUFFER_MINUTES = 10;
    const validity = isValidAttendanceTime(now, role, BUFFER_MINUTES);
    if (!validity.isValid) {
      throw new Error(validity.message);
    }
    const shift_time = getCurrentShift(now);

    const result = await db.collection("class_attendance").insertOne({
      student_id: new ObjectId(data.student_id),
      date: data.date,
      status: data.status,
      created_at: now,
      updated_at: now,
      shift_time: shift_time,
      is_late: Boolean(data.is_late ?? validity.isLate),
      late_minutes: data.late_minutes ?? validity.lateMinutes ?? 0,
    });

    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    console.error("Error creating attendance:", error);
    throw error;
  }
}

export async function getAttendanceStatus(studentIds: string[]) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const attendanceRecords = await db
      .collection("class_attendance")
      .find({
        student_id: { $in: studentIds.map((id) => new ObjectId(id)) },
        date: { $gte: today },
      })
      .toArray();

    const statusMap: Record<string, string> = {};
    attendanceRecords.forEach((record) => {
      statusMap[record.student_id.toString()] = record.status;
    });

    return statusMap;
  } catch (error) {
    console.error("Error fetching attendance status:", error);
    throw error;
  }
}

export async function createTeacherLeaveRequest(params: { date: Date; reason: string; slotKey: string; role?: Role }) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const teacher = await db.collection("teachers").findOne({
    user_id: new ObjectId(session.user.id),
  });

  if (!teacher?._id) {
    throw new Error("Data ustadz tidak ditemukan");
  }

  const now = new Date();
  const targetDate = new Date(params.date);
  targetDate.setHours(0, 0, 0, 0);

  const dayOfWeek = targetDate.getDay();
  const role = params.role || 'teacher';
  const schedules = getSchedulesByRole(role)[dayOfWeek] || [];

  if (schedules.length === 0) {
    throw new Error("Tidak ada jadwal mengajar pada hari yang dipilih.");
  }

  let targetShift = null as null | { start: number; end: number };

  if (params.slotKey === "full_day") {
    targetShift = schedules[0];
  } else {
    const [startStr, endStr] = params.slotKey.split("-");
    const start = Number(startStr);
    const end = Number(endStr);
    targetShift = schedules.find((s) => s.start === start && s.end === end) || null;
  }

  if (!targetShift) {
    throw new Error("Waktu mengajar yang dipilih tidak sesuai dengan jadwal hari tersebut.");
  }

  const startMinutes = targetShift.start;
  const startDate = new Date(targetDate);
  startDate.setHours(
    Math.floor(startMinutes / 60),
    startMinutes % 60,
    0,
    0
  );

  const diffMs = startDate.getTime() - now.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes < 120) {
    throw new Error("Perizinan hanya dapat diajukan maksimal 2 jam sebelum jadwal pertama hari tersebut.");
  }

  const timeLabels = getTimeLabelsByRole(role);
  const slotLabel =
    params.slotKey === "full_day"
      ? "Sehari penuh"
      : timeLabels[params.slotKey] || params.slotKey;

  const result = await db.collection("teacher_leave_requests").insertOne({
    teacher_id: teacher._id,
    user_id: new ObjectId(session.user.id),
    date: targetDate,
    reason: params.reason,
    slot_key: params.slotKey,
    slot_label: slotLabel,
    status: "pending",
    role: role,
    created_at: now,
    updated_at: now,
  });

  return { success: true, id: result.insertedId.toString() };
}
