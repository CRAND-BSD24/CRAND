"use client";

import React from "react";
import Link from "next/link";
import AttendanceButton from "@/components/AttendanceButton";

export default function AbsensiPage() {
  const handleAttendanceSuccess = (name: string, timestamp: string) => {
    console.log(`Absensi berhasil untuk ${name} pada ${timestamp}`);
  };

  const handleAttendanceError = (message: string) => {
    console.error(message);
  };

  return (
    <div className="min-h-screen bg-[#9ACBD0] flex flex-col items-center px-4 py-10">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-[#48A6A7] mb-8">
        <h2 className="text-3xl font-bold text-[#006A71] text-center mb-6">
          Absensi Kehadiran
        </h2>

        <AttendanceButton
          onSuccess={handleAttendanceSuccess}
          onError={handleAttendanceError}
        />

        <Link
          href="/admin/attendance/history"
          className="block w-full bg-[#48A6A7] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#3d9395] transition-all duration-300 text-center mt-6"
        >
          Lihat Riwayat Absensi
        </Link>
      </div>
    </div>
  );
}
