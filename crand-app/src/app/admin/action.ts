"use server";

import { getMongoClientInstance } from "@/db/config/connection";

export const getAllStudents = async () => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const students = await db.collection("students").find({}).toArray();

  const data = JSON.stringify(students);
  return data;
};

export const getAllTeachers = async () => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const teachers = await db.collection("teachers").find({}).toArray();

  const data = JSON.stringify(teachers);
  return data;
};

export async function getTeacherAttendanceStats() {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    const attendanceCollection = db.collection("teacher_attendance");

    // Mendapatkan tanggal hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Mendapatkan tanggal 7 hari yang lalu
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Menghitung total kehadiran per hari dalam 7 hari terakhir
    const dailyAttendance = await attendanceCollection
      .aggregate([
        {
          $match: {
            date: {
              $gte: sevenDaysAgo,
              $lte: new Date(),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    // Menghitung total guru
    const teacherCollection = db.collection("teachers");
    const totalTeachers = await teacherCollection.countDocuments();

    // Menghitung rata-rata kehadiran per hari
    const totalDays = dailyAttendance.length || 1; // Hindari pembagian dengan 0
    const totalAttendance = dailyAttendance.reduce(
      (sum, day) => sum + day.count,
      0
    );
    const averageAttendance =
      (totalAttendance / totalDays / totalTeachers) * 100;

    // Format data untuk grafik
    const labels = dailyAttendance.map((day) => {
      const date = new Date(day._id);
      return date.toLocaleDateString("id-ID", { weekday: "long" });
    });

    const data = dailyAttendance.map((day) =>
      ((day.count / totalTeachers) * 100).toFixed(1)
    );

    return JSON.stringify({
      averageAttendance: averageAttendance.toFixed(1),
      chartData: {
        labels,
        data,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher attendance stats:", error);
    return JSON.stringify({
      averageAttendance: 0,
      chartData: {
        labels: [],
        data: [],
      },
    });
  }
}

export async function getMonthlyStats() {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    // Format data untuk grafik - 12 bulan terakhir
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return d.toLocaleString("id-ID", { month: "long" });
    });

    // Inisialisasi array
    const teacherData = new Array(12).fill(0);
    const studentData = new Array(12).fill(0);

    // Mendapatkan semua guru dengan tanggal pembuatan
    const teachers = await db.collection("teachers").find({}).toArray();

    // Mendapatkan semua santri dengan tanggal pembuatan
    const students = await db.collection("students").find({}).toArray();

    console.log("Total teachers found:", teachers.length);
    console.log("Total students found:", students.length);

    // Menghitung total guru per bulan
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    teachers.forEach((teacher) => {
      const createdAt = new Date(teacher.created_at);
      const monthDiff =
        (currentYear - createdAt.getFullYear()) * 12 +
        (currentMonth - createdAt.getMonth());

      if (monthDiff < 12) {
        // Mengisi data dari bulan pembuatan sampai bulan terakhir
        const startIndex = 11 - monthDiff;
        for (let i = startIndex; i < 12; i++) {
          teacherData[i]++;
        }
      } else {
        // Jika guru dibuat lebih dari 12 bulan yang lalu,
        // tambahkan ke semua bulan
        for (let i = 0; i < 12; i++) {
          teacherData[i]++;
        }
      }
    });

    // Menghitung total santri per bulan
    students.forEach((student) => {
      const createdAt = new Date(student.created_at);
      const monthDiff =
        (currentYear - createdAt.getFullYear()) * 12 +
        (currentMonth - createdAt.getMonth());

      if (monthDiff < 12) {
        // Mengisi data dari bulan pembuatan sampai bulan terakhir
        const startIndex = 11 - monthDiff;
        for (let i = startIndex; i < 12; i++) {
          studentData[i]++;
        }
      } else {
        // Jika santri dibuat lebih dari 12 bulan yang lalu,
        // tambahkan ke semua bulan
        for (let i = 0; i < 12; i++) {
          studentData[i]++;
        }
      }
    });

    console.log("Formatted data:", {
      labels: months,
      teacherData,
      studentData,
    });

    return JSON.stringify({
      labels: months,
      teacherData,
      studentData,
    });
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    return JSON.stringify({
      labels: [],
      teacherData: [],
      studentData: [],
    });
  }
}
