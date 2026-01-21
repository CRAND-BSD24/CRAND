"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AttendanceButton = dynamic(() => import("@/components/AttendanceButton"), { ssr: false });

const scheduleInfo = [
  { day: "Senin", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "16:00 - 17:15"] },
  { day: "Selasa", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
  { day: "Rabu", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
  { day: "Kamis", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "16:00 - 17:15"] },
  { day: "Jumat", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
  { day: "Sabtu", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00"] },
  { day: "Minggu", times: ["Libur"] },
];

export default function AbsensiPage() {
  const [showSchedule, setShowSchedule] = useState(false);

  const handleAttendanceSuccess = (name: string, timestamp: string) => {
    console.log(`Absensi berhasil untuk ${name} pada ${timestamp}`);
  };

  const handleAttendanceError = (message: string) => {
    console.error(message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center px-4 py-10">
      <div className="bg-white shadow-2xl rounded-2xl mt-10 p-8 w-full max-w-lg border-t-4 border-emerald-800 mb-8 transition-all duration-300 hover:shadow-emerald-200/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-emerald-800 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Absensi Kehadiran
          </h2>
          <Button
            variant="outline"
            onClick={() => setShowSchedule(true)}
            className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          >
            Lihat Jadwal
          </Button>
        </div>

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
  );
}
