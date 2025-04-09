"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

interface WeeklyProgress {
  memorization: number[];
  academic: number[];
}

interface DashboardData {
  averageMemorization: number;
  totalMemorizationThisWeek: number;
  attendanceRate: number;
  presentDaysThisWeek: number;
  totalWorkingDays: number;
  weeklyProgress: WeeklyProgress;
}

// Fungsi untuk menghitung jumlah halaman dari string pages
function calculatePages(pages: string): number {
  if (!pages) return 0;

  // Jika pages berupa angka tunggal
  if (!pages.includes("-")) {
    return 1;
  }

  // Jika pages berupa range (contoh: "1-2")
  const [start, end] = pages.split("-").map((num) => parseInt(num.trim()));
  return end - start + 1;
}

// Fungsi untuk mendapatkan data dashboard
export async function getDashboardData(): Promise<DashboardData> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    // Mendapatkan student_id dari user yang login
    const student = await db.collection("students").findOne({
      user_id: new ObjectId(session.user.id),
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const studentId = student._id;

    // Mendapatkan data hafalan 30 hari terakhir
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const memorizations = await db
      .collection("memorization_grades")
      .find({
        student_id: studentId,
        updated_at: { $gte: thirtyDaysAgo },
      })
      .sort({ updated_at: 1 })
      .toArray();

    // Menghitung progress mingguan
    const weeklyProgress: WeeklyProgress = {
      memorization: [0, 0, 0, 0],
      academic: [0, 0, 0, 0],
    };

    // Array untuk menyimpan jumlah setoran per minggu
    const weeklySubmissions = [0, 0, 0, 0];

    // Mendapatkan awal minggu ini
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Menghitung total hafalan minggu ini
    const thisWeekMemorizations = memorizations.filter(
      (memo) => new Date(memo.updated_at) >= startOfWeek
    );

    const totalMemorizationThisWeek = thisWeekMemorizations.reduce(
      (total, memo) => total + calculatePages(memo.pages),
      0
    );

    // Mengelompokkan hafalan per minggu
    memorizations.forEach((memo) => {
      const date = new Date(memo.updated_at);
      const weekIndex =
        3 -
        Math.floor(
          (new Date().getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );

      if (weekIndex >= 0 && weekIndex < 4) {
        weeklyProgress.memorization[weekIndex] += calculatePages(memo.pages);
        weeklySubmissions[weekIndex]++;
      }
    });

    // Menghitung rata-rata per minggu
    weeklyProgress.memorization = weeklyProgress.memorization.map(
      (total, index) => {
        const submissions = weeklySubmissions[index];
        return submissions > 0 ? total / submissions : 0;
      }
    );

    // Menghitung rata-rata keseluruhan
    const totalPages = memorizations.reduce(
      (total, memo) => total + calculatePages(memo.pages),
      0
    );
    const averageMemorization =
      memorizations.length > 0 ? totalPages / memorizations.length : 0;

    // Mendapatkan data kehadiran minggu ini dari class_attendance
    const attendances = await db
      .collection("class_attendance")
      .find({
        student_id: studentId,
        date: { $gte: startOfWeek },
        status: "Present",
      })
      .toArray();

    // Hitung total hari kerja yang sudah berlalu minggu ini (Senin-Jumat)
    const currentDay = today.getDay(); // 0 = Minggu, 1 = Senin, dst
    let elapsedWorkingDays = 0;

    // Hitung hari kerja yang sudah berlalu minggu ini
    for (let i = 1; i <= currentDay; i++) {
      if (i <= 5) {
        // Senin-Jumat
        elapsedWorkingDays++;
      }
    }

    const presentDays = attendances.length;
    const attendanceRate =
      elapsedWorkingDays > 0 ? (presentDays / elapsedWorkingDays) * 100 : 0;

    // Untuk sementara academic masih 0 karena belum ada data
    weeklyProgress.academic = [0, 0, 0, 0];

    return {
      averageMemorization,
      totalMemorizationThisWeek,
      attendanceRate,
      presentDaysThisWeek: presentDays,
      totalWorkingDays: elapsedWorkingDays,
      weeklyProgress,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

export async function getAllTeachers() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const teachers = await db.collection("teachers").find({}).toArray();
    return JSON.stringify(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
}

export async function getAllStudents() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const students = await db.collection("students").find({}).toArray();
    return JSON.stringify(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
}
