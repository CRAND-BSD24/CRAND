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
    status: "present" | "absent" | "sick" | "permission" | "holiday";
  }[];
}

// Data dummy untuk absensi
const dummyStudents = [
  { id: "1", name: "Ahmad Farhan", class: "10A" },
  { id: "2", name: "Fatimah Azzahra", class: "10A" },
  { id: "3", name: "Muhammad Rizky", class: "10B" },
  { id: "4", name: "Siti Nurhaliza", class: "10B" },
  { id: "5", name: "Abdul Rahman", class: "10C" },
];

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
    // Generate data dummy untuk bulan yang dipilih
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const daysInMonth = endDate.getDate();

    // Filter data dummy untuk siswa yang login
    const student = dummyStudents.find((s) => s.id === studentId);
    if (!student) {
      return [];
    }

    const attendance = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month - 1, i + 1);

      // Cek apakah hari Minggu atau libur nasional
      if (isSunday(date) || isNationalHoliday(date)) {
        return {
          date,
          status: "holiday" as const,
        };
      }

      // Random status untuk setiap hari
      const statuses: ("present" | "absent" | "sick" | "permission")[] = [
        "present",
        "absent",
        "sick",
        "permission",
      ];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      return {
        date,
        status,
      };
    });

    return [
      {
        _id: student.id,
        name: student.name,
        class: student.class,
        attendance,
      },
    ];
  } catch (error) {
    console.error("Error fetching monthly attendance:", error);
    return [];
  }
}
