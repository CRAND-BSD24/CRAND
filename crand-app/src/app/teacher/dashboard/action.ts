"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { getStudentsByTeacherId } from "../attendance/action";
import { getStudentMemorization } from "../memorization/action";

// Fungsi untuk normalisasi data pages
function normalizePages(pages: any): { start: number; end: number } | null {
  try {
    // Jika pages adalah number langsung
    if (typeof pages === "number") {
      return { start: pages, end: pages };
    }

    if (!pages || typeof pages !== "string") {
      return null;
    }

    // Bersihkan string dari kata "Halaman" dan spasi berlebih
    const cleanPages = pages.replace(/halaman/i, "").trim();

    // Coba split dengan berbagai separator
    const separators = ["-", " - ", " -", "- "];
    let parts: string[] = [];

    for (const separator of separators) {
      if (cleanPages.includes(separator)) {
        parts = cleanPages.split(separator);
        break;
      }
    }

    // Jika tidak ada separator, coba parse sebagai single number
    if (parts.length === 0) {
      const singleNumber = parseInt(cleanPages);
      if (!isNaN(singleNumber)) {
        return { start: singleNumber, end: singleNumber };
      }
      return null;
    }

    // Parse start dan end
    const start = parseInt(parts[0]);
    const end = parseInt(parts[1]);

    if (!isNaN(start) && !isNaN(end) && end >= start) {
      return { start, end };
    }

    return null;
  } catch (error) {
    console.error("Error normalizing pages:", error);
    return null;
  }
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

    // Get memorization data using the same function as memorization page
    const memorizationData = await getStudentMemorization();
    console.log("Raw Memorization Data:", memorizationData);

    // Calculate average memorization
    const validData = memorizationData.filter((record) => {
      const normalized = normalizePages(record.pages);
      return normalized !== null;
    });

    console.log("Valid Data:", validData);

    const totalPages = validData.reduce((sum, record) => {
      const normalized = normalizePages(record.pages);
      if (!normalized) return sum;

      const pageCount = normalized.end - normalized.start + 1;
      console.log(`Pages for ${record.name}:`, {
        original: record.pages,
        normalized,
        pageCount,
        currentSum: sum,
        newSum: sum + pageCount,
      });
      return sum + pageCount;
    }, 0);

    const averageMemorization =
      validData.length > 0 ? totalPages / validData.length : 0;
    console.log("Average Memorization:", {
      totalPages,
      totalRecords: validData.length,
      average: averageMemorization,
    });

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

    // Bagi data ke dalam 4 minggu secara merata
    const dataPerWeek = Math.ceil(validData.length / 4);
    const weeklyMemorization = Array(4)
      .fill(0)
      .map((_, weekIndex) => {
        const startIndex = weekIndex * dataPerWeek;
        const endIndex = Math.min(startIndex + dataPerWeek, validData.length);
        const weekData = validData.slice(startIndex, endIndex);

        const weeklyTotal = weekData.reduce((sum, record) => {
          const normalized = normalizePages(record.pages);
          if (!normalized) return sum;

          const pageCount = normalized.end - normalized.start + 1;
          return sum + pageCount;
        }, 0);

        console.log(`Week ${weekIndex + 1}:`, {
          weekData: weekData.map((d) => ({
            name: d.name,
            pages: d.pages,
            normalized: normalizePages(d.pages),
          })),
          totalPages: weeklyTotal,
          average: weekData.length > 0 ? weeklyTotal / weekData.length : 0,
        });

        return weekData.length > 0 ? weeklyTotal / weekData.length : 0;
      });

    // Get weekly academic progress
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

    // Get top students based on memorization
    const topStudents = validData
      .sort((a, b) => {
        try {
          // Ekstrak nomor juz dari nama juz
          const getJuzNumber = (juzName: string) => {
            const match = juzName.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };

          const aJuzNumber = getJuzNumber(a.juz_name);
          const bJuzNumber = getJuzNumber(b.juz_name);

          // Jika juz berbeda, urutkan berdasarkan nomor juz
          if (aJuzNumber !== bJuzNumber) {
            return bJuzNumber - aJuzNumber;
          }

          // Jika juz sama, bandingkan jumlah halaman
          const aNormalized = normalizePages(a.pages);
          const bNormalized = normalizePages(b.pages);

          if (!aNormalized || !bNormalized) return 0;

          const aPages = aNormalized.end - aNormalized.start + 1;
          const bPages = bNormalized.end - bNormalized.start + 1;
          return bPages - aPages;
        } catch (error) {
          console.error("Error comparing students:", error);
          return 0;
        }
      })
      .slice(0, 3)
      .map((student) => ({
        name: student.name,
        class_name: `Kelas ${student.class_name}`,
        achievement: `${student.juz_name} (${student.pages} halaman)`,
      }));

    return {
      averageMemorization,
      attendanceRate,
      weeklyProgress: {
        memorization: weeklyMemorization,
        academic: weeklyAcademic,
      },
      topStudents,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}
