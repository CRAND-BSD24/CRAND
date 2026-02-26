"use client";

import React from "react";
import Link from "next/link";

export default function AttendanceHistoryPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 to-teal-50 flex flex-col items-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="bg-white mt-13 shadow-2xl rounded-2xl p-4 sm:p-8 w-full max-w-md md:max-w-3xl border-t-4 border-blue-800 transition-all duration-300 hover:shadow-blue-200/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 flex items-center gap-2 sm:gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 sm:h-8 sm:w-8"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
              </svg>
              Riwayat Absensi
            </h2>
          </div>
          <Link
            href="/admin/attendance"
            className="bg-blue-800 text-white py-2 px-3 sm:px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 shadow-md transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Kembali ke Absensi
          </Link>
        </div>

        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4 sm:p-6 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
            Akses Riwayat Absensi Dipindahkan
          </h3>
          <p className="text-sm sm:text-base text-blue-900 mb-3">
            Tampilan riwayat absensi tidak lagi tersedia di menu Admin. Untuk
            menjaga pemisahan tugas dan akses data, pengelolaan dan peninjauan
            riwayat absensi kini sepenuhnya dilakukan oleh tim HRD.
          </p>
          <p className="text-xs sm:text-sm text-blue-800">
            Jika Anda membutuhkan data riwayat absensi tertentu (misalnya untuk
            keperluan audit, penilaian kinerja, atau laporan khusus), silakan
            hubungi tim HRD dan sertakan detail periode dan nama pegawai yang
            dibutuhkan.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h4 className="font-semibold text-slate-900 mb-2">
            Mengapa akses ini dibatasi?
          </h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Pemisahan tugas yang lebih jelas antara Admin dan HRD.</li>
            <li>Penguatan perlindungan data kehadiran dan privasi pegawai.</li>
            <li>
              Mengurangi risiko penyalahgunaan data dengan membatasi siapa yang
              dapat melihat detail riwayat absensi.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
