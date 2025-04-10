"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export interface AttendanceRecord {
  _id: string;
  name: string;
  timestamp: Date;
  photo: Buffer;
}

export interface MonthlyAttendance {
  _id: string;
  name: string;
  class: string;
  attendance: {
    date: Date;
    status: "Present" | "Absent" | "Sick" | "Permission" | "Holiday" | "";
  }[];
}

// Fungsi untuk mengecek apakah suatu hari adalah hari Minggu
const isSunday = (date: Date): boolean => {
  return date.getDay() === 0;
};

// Fungsi untuk mengecek apakah suatu hari adalah libur nasional
const isNationalHoliday = (date: Date): boolean => {
  // Contoh libur nasional (tahun 2024)
  const nationalHolidays = [
    "2024-01-01", // Tahun Baru
    "2024-02-10", // Tahun Baru Imlek
    "2024-03-11", // Isra Mi'raj
    "2024-03-29", // Jumat Agung
    "2024-04-10", // Idul Fitri
    "2024-04-11", // Idul Fitri
    "2024-05-01", // Hari Buruh
    "2024-05-09", // Kenaikan Isa Almasih
    "2024-05-23", // Hari Raya Waisak
    "2024-06-01", // Hari Lahir Pancasila
    "2024-06-17", // Idul Adha
    "2024-07-07", // Tahun Baru Islam
    "2024-08-17", // Hari Kemerdekaan
    "2024-09-16", // Maulid Nabi
    "2024-12-25", // Natal
  ];

  const dateString = date.toISOString().split("T")[0];
  return nationalHolidays.includes(dateString);
};

export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    const attendanceCollection = db.collection("attendance");

    const records = await attendanceCollection
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    // console.log(records,"<<<<<");

    // Convert ObjectId to string and Binary photo to base64
    return records.map((record) => ({
      _id: record._id.toString(),
      name: record.name,
      timestamp: record.timestamp,
      photo: record.photo.buffer.toString("base64"),
    })) as AttendanceRecord[];
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return [];
  }
}

export async function getMonthlyAttendance(
  year: number,
  month: number,
  studentId: string
): Promise<MonthlyAttendance[]> {
  try {
    // console.log("Getting monthly attendance for:", { year, month, studentId });

    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    // Ambil data siswa
    const studentsCollection = db.collection("students");
    // console.log("Finding student with ID:", studentId);

    const student = await studentsCollection.findOne({
      user_id: new ObjectId(studentId),
    });

    const kelas = await db.collection("classes").findOne({
      _id: new ObjectId(student?.class_id.toString()),
    });

    // console.log("Found student:", student);

    if (!student) {
      console.error("Student not found");
      return [];
    }

    // Ambil data absensi
    const attendanceCollection = db.collection("class_attendance");

    // Tentukan rentang tanggal
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // console.log("Searching attendance records between:", {
    //   startDate: startDate.toISOString(),
    //   endDate: endDate.toISOString(),
    // });

    const query = {
      student_id: new ObjectId(student._id.toString()),
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    // console.log("Attendance query:", JSON.stringify(query));

    const attendanceRecords = await attendanceCollection.find(query).toArray();

    // console.log("Found attendance records:", attendanceRecords);

    // Pastikan status yang diambil dari database sesuai dengan yang diharapkan
    attendanceRecords.forEach((record) => {
      console.log(`Record for date ${record.date}:`, record.status);
    });

    // Generate attendance array untuk setiap hari dalam bulan
    const daysInMonth = endDate.getDate();
    const attendance = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month - 1, i + 1);

      // Cek apakah hari Minggu atau libur nasional
      if (isSunday(date) || isNationalHoliday(date)) {
        return {
          date,
          status: "Holiday" as const,
        };
      }

      // Cari record absensi untuk tanggal ini
      const record = attendanceRecords.find((record) => {
        const recordDate = new Date(record.date);
        return (
          recordDate.getDate() === date.getDate() &&
          recordDate.getMonth() === date.getMonth() &&
          recordDate.getFullYear() === date.getFullYear()
        );
      });
      // console.log(record, "record");

      // Jika tidak ada record, anggap Absent
      if (!record) {
        // Jika tanggal lebih dari hari ini, biarkan status kosong
        if (date > new Date()) {
          return {
            date,
            status: "" as const,
          };
        }
        return {
          date,
          status: "Absent" as const,
        };
      }

      // Konversi status ke format yang benar (kapitalisasi)
      const statusMap: {
        [key: string]: "Present" | "Absent" | "Sick" | "Permission";
      } = {
        present: "Present",
        absent: "Absent",
        sick: "Sick",
        permission: "Permission",
      };

      return {
        date,
        status: statusMap[record.status.toLowerCase()] || "Absent",
      };
    });

    const result = [
      {
        _id: student._id.toString(),
        name: student.name,
        class: kelas?.class_name,
        attendance,
      },
    ];

    // console.log("Returning result:", result);
    // console.log(kelas, "kelas");

    return result;
  } catch (error) {
    console.error("Error fetching monthly attendance:", error);
    return [];
  }
}