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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center px-4 py-10">
      <div className="bg-white shadow-2xl rounded-2xl mt-10 p-8 w-full max-w-lg border-t-4 border-emerald-800 mb-8 transition-all duration-300 hover:shadow-emerald-200/50">
        <h2 className="text-3xl font-bold text-emerald-800 text-center mb-6 flex items-center justify-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          Absensi Kehadiran
        </h2>

        <AttendanceButton
          onSuccess={handleAttendanceSuccess}
          onError={handleAttendanceError}
          type="admin"
          isModalOpen={true}
        />

        <Link
          href="/admin/attendance/history"
          className="w-full bg-emerald-800 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-300 mt-6 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
          </svg>
          Lihat Riwayat Absensi
        </Link>
      </div>
      
      <div className="w-full max-w-lg px-4 py-3 rounded-xl bg-emerald-800/10 backdrop-blur-sm border border-emerald-800/20 mt-4">
        <div className="flex items-center text-sm text-emerald-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p>Tekan tombol di atas untuk melakukan absensi. Pastikan kamera dalam keadaan aktif.</p>
        </div>
      </div>
    </div>
  );
}
