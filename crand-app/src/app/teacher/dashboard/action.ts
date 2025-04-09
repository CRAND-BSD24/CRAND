"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { getStudentsByTeacherId } from "../attendance/action";
import {
  getStudentMemorization,
  getMemorizationHistory,
  type MemorizationStudent,
  type MemorizationHistory,
} from "../memorization/action";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";

// Fungsi untuk menghitung jumlah halaman yang disetor
function countPages(pages: any): number {
  try {
    if (!pages || typeof pages !== "string") {
      return 0;
    }

    // Bersihkan string dari kata "Halaman" dan spasi berlebih
    const cleanPages = pages.replace(/Halaman/i, "").trim();

    // Jika hanya angka tunggal
    if (!cleanPages.includes("-")) {
      const singlePage = parseInt(cleanPages);
      return !isNaN(singlePage) ? 1 : 0;
    }

    // Jika ada range (mengandung "-")
    const parts = cleanPages.split(/\s*-\s*/);
    if (parts.length === 2) {
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        return end - start + 1; // Menghitung jumlah halaman dalam range
      }
    }
    return 0;
  } catch (error) {
    console.error("Error counting pages:", error);
    return 0;
  }
}

// Fungsi untuk mengelompokkan data per siswa
function groupByStudent(data: any[]) {
  return data.reduce((acc, curr) => {
    const key = curr.student_id || curr.id;
    if (!acc[key]) {
      acc[key] = {
        name: curr.name,
        class_name: curr.class_name,
        juz_name: curr.juz_name,
        totalPages: 0,
        submissions: [],
      };
    }
    const pageCount = countPages(curr.pages);
    acc[key].totalPages += pageCount;
    acc[key].submissions.push({
      pages: curr.pages,
      pageCount,
    });
    return acc;
  }, {});
}

export interface DashboardData {
  averageMemorization: number;
  attendanceRate: number;
  weeklyProgress: {
    memorization: number[];
    academic: number[];
  };
  topStudents: {
    name: string;
    class_name: string;
    achievement: string;
  }[];
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

    // Get current week's data for each student
    const currentDate = new Date();
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(currentDate, { weekStartsOn: 1 });

    // Get memorization data for all students
    const memorizationData = await getStudentMemorization();

    // Collect weekly history for each student
    const studentWeeklyData: { [key: string]: MemorizationHistory[] } = {};

    for (const student of memorizationData) {
      const history = await getMemorizationHistory(
        student.id,
        startOfCurrentWeek,
        endOfCurrentWeek
      );
      studentWeeklyData[student.id] = history;
    }

    // Calculate total pages for each student this week
    const studentTotalPages = Object.entries(studentWeeklyData).map(
      ([studentId, history]) => {
        const student = memorizationData.find((s) => s.id === studentId);
        const totalPages = history.reduce((sum, record) => {
          return sum + countPages(record.pages);
        }, 0);

        return {
          id: studentId,
          name: student?.name || "",
          class_name: student?.class_name || "",
          juz_name: student?.juz_name || "",
          totalPages,
        };
      }
    );

    console.log("Student Total Pages:", studentTotalPages);

    // Calculate average memorization
    const totalPages = studentTotalPages.reduce(
      (sum, student) => sum + student.totalPages,
      0
    );
    const averageMemorization =
      studentTotalPages.length > 0 ? totalPages / studentTotalPages.length : 0;

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

    // Get weekly progress data for the last 4 weeks
    const weeklyMemorization = await Promise.all(
      Array.from({ length: 4 }).map(async (_, index) => {
        const weekStart = startOfWeek(subWeeks(currentDate, index), {
          weekStartsOn: 1,
        });
        const weekEnd = endOfWeek(subWeeks(currentDate, index), {
          weekStartsOn: 1,
        });

        let weeklyTotal = 0;
        let studentCount = 0;

        for (const student of memorizationData) {
          const weekHistory = await getMemorizationHistory(
            student.id,
            weekStart,
            weekEnd
          );
          const studentWeeklyPages = weekHistory.reduce((sum, record) => {
            return sum + countPages(record.pages);
          }, 0);

          if (studentWeeklyPages > 0) {
            weeklyTotal += studentWeeklyPages;
            studentCount++;
          }
        }

        return studentCount > 0 ? weeklyTotal / studentCount : 0;
      })
    );

    // Get weekly academic progress
    const weeklyAcademic = await Promise.all(
      Array.from({ length: 4 }).map(async (_, index) => {
        const weekStart = startOfWeek(subWeeks(currentDate, index), {
          weekStartsOn: 1,
        });
        const weekEnd = endOfWeek(subWeeks(currentDate, index), {
          weekStartsOn: 1,
        });

        const weekData = await db
          .collection("grades")
          .find({
            student_id: { $in: studentIds },
            created_at: { $gte: weekStart, $lte: weekEnd },
          })
          .toArray();

        return weekData.length > 0
          ? weekData.reduce((sum, record) => sum + record.score, 0) /
              weekData.length
          : 0;
      })
    );

    // Get top students based on total pages this week
    const topStudents = studentTotalPages
      .sort((a, b) => b.totalPages - a.totalPages)
      .slice(0, 3)
      .map((student) => ({
        name: student.name,
        class_name: `Kelas ${student.class_name}`,
        achievement: `${student.juz_name} (${student.totalPages} halaman)`,
      }));

    return {
      averageMemorization,
      attendanceRate,
      weeklyProgress: {
        memorization: weeklyMemorization.reverse(),
        academic: weeklyAcademic.reverse(),
      },
      topStudents,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}
