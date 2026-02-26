"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface TeacherLeaveRequestItem {
  _id: string;
  teacher_name: string;
  date: string;
  slot_label: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export async function getTeacherLeaveRequests(): Promise<TeacherLeaveRequestItem[]> {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const requests = await db
    .collection("teacher_leave_requests")
    .aggregate([
      {
        $lookup: {
          from: "teachers",
          localField: "teacher_id",
          foreignField: "_id",
          as: "teacher",
        },
      },
      { $unwind: { path: "$teacher", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          let: { teacher_user_id: "$teacher.user_id", request_user_id: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", "$$teacher_user_id"] },
                    { $eq: ["$_id", "$$request_user_id"] }
                  ]
                }
              }
            }
          ],
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: { $toString: "$_id" },
          teacher_name: "$user.name",
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          slot_label: 1,
          reason: 1,
          status: 1,
          created_at: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M",
              date: "$created_at",
            },
          },
        },
      },
      { $sort: { created_at: -1 } },
    ])
    .toArray();

  return requests as TeacherLeaveRequestItem[];
}

export async function updateTeacherLeaveStatus(id: string, status: "approved" | "rejected") {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const objectId = new ObjectId(id);

  const requestDoc = await db.collection("teacher_leave_requests").findOne({ _id: objectId });

  await db.collection("teacher_leave_requests").updateOne(
    { _id: objectId },
    {
      $set: {
        status,
        updated_at: new Date(),
      },
    }
  );

  const paths = new Set<string>(["/hrd/teacherLeaves"]);

  let role: string | undefined = (requestDoc as any)?.role;

  if (!role && (requestDoc as any)?.teacher_id) {
    const teacher = await db.collection("teachers").findOne({ _id: (requestDoc as any).teacher_id });
    if (teacher) {
      const user = await db.collection("users").findOne({ _id: teacher.user_id });
      role = (user as any)?.role;
    }
  }

  if (!role && (requestDoc as any)?.user_id) {
    const user = await db.collection("users").findOne({ _id: (requestDoc as any).user_id });
    role = (user as any)?.role;
  }

  const r = (role || "").toLowerCase();
  if (r === "teacher") paths.add("/teacher/leaves");
  if (r === "educator") paths.add("/educator/leaves");
  if (r === "manager") {
    paths.add("/manager/leaves");
    paths.add("/manager/permissions");
  }
  if (r === "admin") paths.add("/admin/leaves");
  if (r === "staff") paths.add("/staff/leaves");

  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch {}
  }

  return { success: true };
}
