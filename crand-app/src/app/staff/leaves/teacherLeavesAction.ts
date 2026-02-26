"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export interface TeacherLeaveForTeacher {
  _id: string;
  date: string;
  slot_label: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export async function getTeacherLeavesForCurrentUser(
  month?: number,
  year?: number
): Promise<TeacherLeaveForTeacher[]> {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = new ObjectId(session.user.id);

  const teacher = await db.collection("teachers").findOne({
    user_id: userId,
  });

  if (!teacher?._id) {
    return [];
  }

  const query: any = {
    teacher_id: teacher._id,
  };

  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    query.date = {
      $gte: start,
      $lt: end,
    };
  }

  const rows = await db
    .collection("teacher_leave_requests")
    .find(query)
    .sort({ created_at: -1 })
    .toArray();

  return rows.map((r: any) => ({
    _id: r._id.toString(),
    date:
      r.date instanceof Date
        ? r.date.toISOString().slice(0, 10)
        : new Date(r.date).toISOString().slice(0, 10),
    slot_label: r.slot_label || "",
    reason: r.reason || "",
    status: (r.status as "pending" | "approved" | "rejected") || "pending",
  }));
}
