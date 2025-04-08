"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { getStudentsByTeacherId } from "../attendance/action";

export interface DashboardData {
  averageMemorization: number;
  attendanceRate: number;
  weeklyProgress: {
    memorization: number[];
    academic: number[];
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    // Get teacher's students
    const students = await getStudentsByTeacherId();
    const studentIds = students.map((student) => new ObjectId(student.id));

    // Get memorization data
    const memorizationData = await db
      .collection("memorization_grades")
      .find({
        student_id: { $in: studentIds },
        status: "Completed",
      })
      .toArray();

    // Calculate average memorization
    const totalPages = memorizationData.reduce((sum, record) => {
      const pages = record.pages.split("-").map(Number);
      return sum + (pages[1] - pages[0] + 1);
    }, 0);
    const averageMemorization =
      memorizationData.length > 0 ? totalPages / memorizationData.length : 0;

    // Get attendance data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendanceData = await db
      .collection("class_attendance")
      .find({
        student_id: { $in: studentIds },
        date: { $gte: today },
      })
      .toArray();

    const presentCount = attendanceData.filter(
      (record) => record.status === "Present"
    ).length;
    const attendanceRate =
      attendanceData.length > 0
        ? (presentCount / attendanceData.length) * 100
        : 0;

    // Get weekly progress data
    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      return date;
    });

    const weeklyMemorization = await Promise.all(
      last4Weeks.map(async (weekDate) => {
        const weekStart = new Date(weekDate);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekDate);
        weekEnd.setDate(weekEnd.getDate() + 7);
        weekEnd.setHours(23, 59, 59, 999);

        const weekData = await db
          .collection("memorization_grades")
          .find({
            student_id: { $in: studentIds },
            created_at: { $gte: weekStart, $lte: weekEnd },
            status: "Completed",
          })
          .toArray();

        const totalPages = weekData.reduce((sum, record) => {
          const pages = record.pages.split("-").map(Number);
          return sum + (pages[1] - pages[0] + 1);
        }, 0);

        return weekData.length > 0 ? totalPages / weekData.length : 0;
      })
    );

    const weeklyAcademic = await Promise.all(
      last4Weeks.map(async (weekDate) => {
        const weekStart = new Date(weekDate);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekDate);
        weekEnd.setDate(weekEnd.getDate() + 7);
        weekEnd.setHours(23, 59, 59, 999);

        const weekData = await db
          .collection("grades")
          .find({
            student_id: { $in: studentIds },
            created_at: { $gte: weekStart, $lte: weekEnd },
          })
          .toArray();

        const averageScore =
          weekData.reduce((sum, record) => sum + record.score, 0) /
          weekData.length;
        return weekData.length > 0 ? averageScore : 0;
      })
    );

    return {
      averageMemorization,
      attendanceRate,
      weeklyProgress: {
        memorization: weeklyMemorization.reverse(),
        academic: weeklyAcademic.reverse(),
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}
