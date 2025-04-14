"use client";

import React, { useState, useEffect } from "react";
import {
  getAdminAttendanceRecords,
  getTeacherAttendanceRecords,
} from "../action";
import { AttendanceRecord } from "../action";
import Link from "next/link";
import Image from "next/image";

export default function AttendanceHistoryPage() {
  const [adminRecords, setAdminRecords] = useState<AttendanceRecord[]>([]);
  const [teacherRecords, setTeacherRecords] = useState<AttendanceRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"admin" | "teacher">("admin");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recordsPerPage = 5;

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching records for tab:", activeTab);
        await fetchAttendanceRecords();
      } catch (err) {
        setError("Terjadi kesalahan saat memuat data. Silakan coba lagi.");
        console.error("Error loading records:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecords();
  }, [activeTab]);

  const fetchAttendanceRecords = async () => {
    try {
      if (activeTab === "admin") {
        const records = await getAdminAttendanceRecords();
        console.log("Admin records count:", records.length);
        setAdminRecords(records);
      } else {
        const records = await getTeacherAttendanceRecords();
        console.log("Teacher records count:", records.length);
        setTeacherRecords(records);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      throw error;
    }
  };

  const currentRecords = activeTab === "admin" ? adminRecords : teacherRecords;
  console.log("Current records:", currentRecords);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const paginatedRecords = currentRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(currentRecords.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center px-4 py-6 sm:py-10">
      <div className="bg-white mt-13 shadow-2xl rounded-2xl p-4 sm:p-8 w-full max-w-4xl border-t-4 border-emerald-800 transition-all duration-300 hover:shadow-emerald-200/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 flex items-center gap-2 sm:gap-3">
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
          <Link
            href="/admin/attendance"
            className="bg-emerald-800 text-white py-2 px-3 sm:px-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-300 flex items-center gap-2 shadow-md transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base w-full sm:w-auto justify-center"
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

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab("admin");
              setCurrentPage(1);
            }}
            className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${
              activeTab === "admin"
                ? "text-emerald-800 border-b-2 border-emerald-800"
                : "text-gray-500 hover:text-emerald-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            Admin
          </button>
          <button
            onClick={() => {
              setActiveTab("teacher");
              setCurrentPage(1);
            }}
            className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${
              activeTab === "teacher"
                ? "text-emerald-800 border-b-2 border-emerald-800"
                : "text-gray-500 hover:text-emerald-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Guru
          </button>
        </div>

        <div className="overflow-x-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800"></div>
            </div>
          ) : (
            <table className="w-full border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-emerald-800 text-white">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold rounded-tl-lg text-sm sm:text-base">
                    No
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-sm sm:text-base">
                    Nama
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-sm sm:text-base">
                    Waktu Absen
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold rounded-tr-lg text-sm sm:text-base">
                    Foto
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((record, index) => (
                  <tr
                    key={record._id}
                    className="border-b border-emerald-100 hover:bg-emerald-50/50 transition-colors duration-150"
                  >
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                      {indexOfFirstRecord + index + 1}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-emerald-800 text-sm sm:text-base">
                      {record.name}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                      {new Date(record.timestamp).toLocaleString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 group">
                        <Image
                          src={
                            record.photo
                              ? `data:image/jpeg;base64,${Buffer.from(
                                  record.photo
                                ).toString("base64")}`
                              : "/default-avatar.png"
                          }
                          alt={`Foto ${record.name}`}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {currentRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 sm:py-8 text-emerald-800 bg-emerald-50/70 italic rounded-lg"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 sm:h-12 sm:w-12 text-emerald-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm sm:text-base">
                          Belum ada riwayat absensi
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {currentRecords.length > 0 && (
          <div className="flex flex-wrap justify-center mt-6 sm:mt-8 gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 transition-all duration-200 text-sm sm:text-base ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-emerald-800 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Sebelumnya
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-200 text-sm sm:text-base ${
                      currentPage === number
                        ? "bg-emerald-800 text-white font-bold shadow-md"
                        : "bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 transition-all duration-200 text-sm sm:text-base ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-emerald-800 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              Selanjutnya
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
