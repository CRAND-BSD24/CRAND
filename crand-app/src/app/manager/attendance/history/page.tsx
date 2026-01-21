"use client";

import React, { useState, useEffect } from "react";
import { getTeacherAttendanceRecords, AttendanceRecord } from "@/app/admin/attendance/action";
import { getAllTeachersForMemorize, type TeacherItem } from "@/app/manager/memorize/action";
import Link from "next/link";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [showSchedule, setShowSchedule] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");
  const [selectedTimestamp, setSelectedTimestamp] = useState<string>("");
  const [filterName, setFilterName] = useState<string>("");
  const [filterShift, setFilterShift] = useState<string>("");
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>("");
  const [teacherSearchTerm, setTeacherSearchTerm] = useState<string>("");
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const recordsPerPage = 5;

  const shifts = ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "16:00 - 17:15", "18:30 - 20:00"];

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoadingTeachers(true);
        const list = await getAllTeachersForMemorize();
        setTeachers(list);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoadingTeachers(false);
      }
    };
    loadTeachers();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      const records = await getTeacherAttendanceRecords();
      setTeacherRecords(records);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  const filterRecords = (records: AttendanceRecord[]) => {
    return records.filter((record) => {
      const bySidebar = selectedTeacherName ? record.name === selectedTeacherName : true;
      const nameMatch = filterName ? record.name.toLowerCase().includes(filterName.toLowerCase()) : true;
      const shiftMatch = filterShift ? record.timestamp.includes(filterShift) : true;
      return bySidebar && nameMatch && shiftMatch;
    });
  };

  const currentRecords = filterRecords(teacherRecords);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const paginatedRecords = currentRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(currentRecords.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const filteredTeacherNames = teachers
    .map((t) => t.name || "")
    .filter((n) => n.toLowerCase().includes(teacherSearchTerm.toLowerCase()))
    .sort();

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
            <Button variant="outline" onClick={() => setShowSchedule(true)} className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              Lihat Jadwal
            </Button>
          </div>
          <Link href="/manager/attendance" className="bg-emerald-800 text-white py-2 px-3 sm:px-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-300 flex items-center gap-2 shadow-md transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base w-full sm:w-auto justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Absensi
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input type="text" placeholder="Filter berdasarkan nama..." value={filterName} onChange={(e) => setFilterName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          </div>
          <div className="flex-1">
            <select value={filterShift} onChange={(e) => setFilterShift(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              <option value="">Semua Shift</option>
              {shifts.map((shift) => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Admin dihapus, fokus pada daftar ustadz dan riwayat guru */}

        <div className="flex flex-col lg:flex-row gap-6">
          {
            <aside className="lg:w-64 bg-emerald-50/70 rounded-xl border border-emerald-100 p-3 h-fit">
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Cari ustadz..."
                  value={teacherSearchTerm}
                  onChange={(e) => setTeacherSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1 max-h-[50vh] overflow-y-auto">
                {loadingTeachers ? (
                  <div className="text-sm text-emerald-700">Memuat ustadz...</div>
                ) : filteredTeacherNames.length === 0 ? (
                  <div className="text-sm text-emerald-700">Tidak ada ustadz</div>
                ) : (
                  filteredTeacherNames.map((name) => (
                    <button
                      key={name}
                      onClick={() => { setSelectedTeacherName(name); setCurrentPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        selectedTeacherName === name ? "bg-emerald-100 text-emerald-900" : "hover:bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {name}
                    </button>
                  ))
                )}
              </div>
              {selectedTeacherName && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-emerald-700">Dipilih: {selectedTeacherName}</span>
                  <button
                    onClick={() => { setSelectedTeacherName(""); setCurrentPage(1); }}
                    className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded"
                  >
                    Reset
                  </button>
                </div>
              )}
            </aside>
          }

          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-emerald-800 text-white">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold rounded-tl-lg text-sm sm:text-base">No</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-sm sm:text-base">Nama</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-sm sm:text-base">Waktu</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold rounded-tr-lg text-sm sm:text-base">Foto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {paginatedRecords.map((record, index) => (
                  <tr key={String(record._id)} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">{indexOfFirstRecord + index + 1}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-emerald-800 text-sm sm:text-base">
                      <button className="underline hover:text-emerald-900" onClick={() => { setSelectedTeacherName(record.name); setCurrentPage(1); }}>
                        {record.name}
                      </button>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-emerald-700 text-sm sm:text-base">{record.timestamp}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      {record.photo ? (
                        <button onClick={() => { setSelectedPhoto(record.photo); setSelectedName(record.name); setSelectedTimestamp(record.timestamp); setShowPhotoDialog(true); }} className="text-emerald-700 hover:text-emerald-900 underline">
                          Lihat Foto
                        </button>
                      ) : (
                        <span className="text-gray-500">Tidak ada foto</span>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedRecords.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-emerald-800 bg-emerald-50/70 italic">Tidak ada data untuk tab ini</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-xs sm:text-sm bg-emerald-50 text-emerald-800 px-3 sm:px-4 py-2 rounded-lg border border-emerald-200">
              Menampilkan <span className="font-bold">{indexOfFirstRecord + 1}</span> - <span className="font-bold">{Math.min(indexOfLastRecord, currentRecords.length)}</span> dari <span className="font-bold">{currentRecords.length}</span> data
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => paginate(page)} className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-200 text-sm sm:text-base ${currentPage === page ? 'bg-emerald-800 text-white' : 'bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50'}`}>{page}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Foto Absensi</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-emerald-800">{selectedName}</p>
            <p className="text-sm text-emerald-800">{selectedTimestamp}</p>
            {selectedPhoto && (
              <Image src={selectedPhoto.startsWith('data:') ? selectedPhoto : `data:image/png;base64,${selectedPhoto}`} alt="Foto Absensi" width={400} height={300} className="rounded-lg" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="border-b border-emerald-100 pb-4">
            <DialogTitle className="flex items-center text-emerald-800 text-xl gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Jadwal Absensi</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 bg-emerald-50/80 rounded-xl p-4 shadow-inner max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-emerald-50/95 z-10 shadow-sm">
                <TableRow className="hover:bg-emerald-100/50">
                  <TableHead className="text-emerald-800 font-bold">Hari</TableHead>
                  <TableHead className="text-emerald-800 font-bold">Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleInfo.map((schedule) => (
                  <TableRow key={schedule.day} className="hover:bg-emerald-100/50">
                    <TableCell className="font-medium text-emerald-700 whitespace-nowrap">{schedule.day}</TableCell>
                    <TableCell>
                      {schedule.times.map((time, index) => (
                        <div key={index} className="text-sm text-emerald-600 py-1 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>{time}</span>
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
  );
}