"use client";

import React, { useState, useEffect } from "react";
import {
  getAdminAttendanceRecords,
  getTeacherAttendanceRecords,
} from "@/app/admin/attendance/action";
import type { AttendanceRecord } from "@/app/admin/attendance/action";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const scheduleInfo = [
  { day: "Senin", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "16:00 - 17:15"] },
  { day: "Selasa", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
  { day: "Rabu", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
  { day: "Kamis", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "16:00 - 17:15"] },
  { day: "Jumat", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
  { day: "Sabtu", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00"] },
  { day: "Minggu", times: ["Libur"] },
];

export default function AttendanceHistoryPage() {
  const [adminRecords, setAdminRecords] = useState<AttendanceRecord[]>([]);
  const [teacherRecords, setTeacherRecords] = useState<AttendanceRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"admin" | "teacher">("admin");
  const [showSchedule, setShowSchedule] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");
  const [selectedTimestamp, setSelectedTimestamp] = useState<string>("");
  const [filterName, setFilterName] = useState<string>("");
  const [filterShift, setFilterShift] = useState<string>("");
  const recordsPerPage = 5;

  const shifts = [
    "04:00 - 04:45",
    "05:30 - 07:00",
    "08:00 - 09:00",
    "16:00 - 17:15",
    "18:30 - 20:00"
  ];


  useEffect(() => {
    fetchAttendanceRecords();
  }, [activeTab]);

  const fetchAttendanceRecords = async () => {
    try {
      if (activeTab === "admin") {
        const records = await getAdminAttendanceRecords();
        setAdminRecords(records);
      } else {
        const records = await getTeacherAttendanceRecords();
        setTeacherRecords(records);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  const filterRecords = (records: AttendanceRecord[]) => {
    return records.filter(record => {
      const nameMatch = filterName ? record.name.toLowerCase().includes(filterName.toLowerCase()) : true;
      const shiftMatch = filterShift ? record.timestamp.includes(filterShift) : true;
      return nameMatch && shiftMatch;
    });
  };

  const currentRecords = filterRecords(activeTab === "admin" ? adminRecords : teacherRecords);

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
          <div className="flex items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 flex items-center gap-2 sm:gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
              </svg>
              Riwayat Absensi
            </h2>
            <Button
              variant="outline"
              onClick={() => setShowSchedule(true)}
              className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            >
              Lihat Jadwal
            </Button>
          </div>
          <Link
            href="/hrd/attendance"
            className="bg-emerald-800 text-white py-2 px-3 sm:px-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-300 flex items-center gap-2 shadow-md transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Absensi
          </Link>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filter berdasarkan nama..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Semua Shift</option>
              {shifts.map((shift) => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </div>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Guru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-emerald-800 text-white">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold rounded-tl-lg text-sm sm:text-base">No</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-sm sm:text-base">Nama</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-sm sm:text-base">Waktu Absen</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold rounded-tr-lg text-sm sm:text-base">Foto</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((record, index) => (
                <tr key={record._id?.toString() || index} className="border-b border-emerald-100 hover:bg-emerald-50/50 transition-colors duration-150">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                    {indexOfFirstRecord + index + 1}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-emerald-800 text-sm sm:text-base">
                    {record.name}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                    {record.timestamp}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 group cursor-pointer" onClick={() => {
                      setSelectedPhoto(record.photo);
                      setSelectedName(record.name);
                      setSelectedTimestamp(record.timestamp);
                      setShowPhotoDialog(true);
                    }}>
                      <Image
                        src={`data:image/jpeg;base64,${record.photo}`}
                        alt={`${record.name}'s attendance`}
                        fill
                        className="object-cover rounded-lg border-2 border-emerald-200 transition-transform duration-300 group-hover:scale-105 shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {currentRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 sm:py-8 text-emerald-800 bg-emerald-50/70 italic rounded-lg">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-12 sm:w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm sm:text-base">Belum ada riwayat absensi</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm bg-emerald-50 text-emerald-800 px-4 py-2 rounded-lg border border-emerald-200">
                Menampilkan <span className="font-bold">{indexOfFirstRecord + 1}</span> - <span className="font-bold">{Math.min(indexOfLastRecord, currentRecords.length)}</span> dari <span className="font-bold">{currentRecords.length}</span> data
              </div>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${
                      currentPage === page
                        ? "bg-emerald-800 text-white font-bold shadow-md"
                        : "bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Photo Dialog */}
        <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center text-emerald-800 text-xl gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Detail Foto Absensi
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative w-full h-64">
                <Image
                  src={`data:image/jpeg;base64,${selectedPhoto}`}
                  alt={`${selectedName}'s attendance photo`}
                  fill
                  className="object-cover rounded-lg border-2 border-emerald-200"
                />
              </div>
              <div className="text-sm text-emerald-800">
                <p className="font-semibold">Nama: {selectedName}</p>
                <p>Waktu: {selectedTimestamp}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
          <DialogContent className="max-w-2xl transform transition-all duration-300 ease-in-out">
            <DialogHeader className="border-b border-emerald-100 pb-4">
              <DialogTitle className="flex items-center text-emerald-800 text-xl gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Jadwal Absensi</span>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 bg-emerald-50/80 backdrop-blur-sm rounded-xl p-4 shadow-inner max-h-[60vh] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-emerald-50/95 backdrop-blur-sm z-10 shadow-sm">
                  <TableRow className="hover:bg-emerald-100/50">
                    <TableHead className="text-emerald-800 font-bold">Hari</TableHead>
                    <TableHead className="text-emerald-800 font-bold">Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleInfo.map((schedule) => (
                    <TableRow key={schedule.day} className="hover:bg-emerald-100/50 transition-all duration-200 ease-in-out">
                      <TableCell className="font-medium text-emerald-700 whitespace-nowrap">{schedule.day}</TableCell>
                      <TableCell>
                        {schedule.times.map((time, index) => (
                          <div key={index} className="text-sm text-emerald-600 py-1 flex items-center gap-2 hover:bg-emerald-100/50 rounded-lg px-2 transition-all duration-200 ease-in-out group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600 transition-colors duration-200" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="group-hover:text-emerald-700 transition-colors duration-200">{time}</span>
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}