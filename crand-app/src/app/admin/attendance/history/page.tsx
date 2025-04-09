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
  const recordsPerPage = 5;

  useEffect(() => {
    console.log("Fetching records for tab:", activeTab);
    fetchAttendanceRecords();
  }, [activeTab]);

  const fetchAttendanceRecords = async () => {
    try {
      if (activeTab === "admin") {
        const records = await getAdminAttendanceRecords();
        console.log("Admin records:", records);
        setAdminRecords(records);
      } else {
        const records = await getTeacherAttendanceRecords();
        console.log("Teacher records:", records);
        setTeacherRecords(records);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
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
    <div className="min-h-screen bg-[#9ACBD0] flex flex-col items-center px-4 py-10">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-4xl border border-[#48A6A7]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#006A71]">Riwayat Absensi</h2>
          <Link
            href="/admin/attendance"
            className="bg-[#48A6A7] text-white py-2 px-4 rounded-xl font-semibold hover:bg-[#3d9395] transition-all duration-300"
          >
            Kembali ke Absensi
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab("admin");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-semibold ${
              activeTab === "admin"
                ? "text-[#006A71] border-b-2 border-[#006A71]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => {
              setActiveTab("teacher");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-semibold ${
              activeTab === "teacher"
                ? "text-[#006A71] border-b-2 border-[#006A71]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Teacher
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#B5DAD6] text-[#004D4D]">
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Waktu Absen</th>
                <th className="px-4 py-3 text-left">Foto</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((record, index) => (
                <tr key={record._id} className="border-t hover:bg-[#f8fafa]">
                  <td className="px-4 py-3">
                    {indexOfFirstRecord + index + 1}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#02676C]">
                    {record.name}
                  </td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3">
                    <div className="relative w-16 h-16">
                      <Image
                        src={`data:image/jpeg;base64,${record.photo}`}
                        alt={`${record.name}'s attendance`}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {currentRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    Belum ada riwayat absensi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {currentRecords.length > 0 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#48A6A7] hover:bg-[#3d9395] text-white"
              }`}
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === number
                      ? "bg-[#48A6A7] text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {number}
                </button>
              )
            )}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#48A6A7] hover:bg-[#3d9395] text-white"
              }`}
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
