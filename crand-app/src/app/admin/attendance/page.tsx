"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState, useEffect } from "react";
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
  { day: "Senin", times: ["07:00 - 16:30"] },
  { day: "Selasa", times: ["07:00 - 16:30"] },
  { day: "Rabu", times: ["07:00 - 16:30"] },
  { day: "Kamis", times: ["07:00 - 16:30"] },
  { day: "Jumat", times: ["07:00 - 16:30"] },
  { day: "Sabtu", times: ["07:00 - 16:30"] },
  { day: "Minggu", times: ["Libur"] },
];

export default function AbsensiPage() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const handleAttendanceSuccess = (name: string, timestamp: string) => {
    console.log(`Absensi berhasil untuk ${name} pada ${timestamp}`);
  };

  const handleAttendanceError = (message: string) => {
    console.error(message);
  };

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 to-teal-50 flex flex-col items-center px-0 sm:px-4 py-6 sm:py-10">
      <div className="bg-white shadow-2xl rounded-2xl mt-6 sm:mt-10 p-5 sm:p-8 w-full max-w-md sm:max-w-lg border-t-4 border-blue-800 mb-8 transition-all duration-300 hover:shadow-blue-200/50">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-blue-800 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Absensi Kehadiran
            </h2>
            <Button
              variant="outline"
              onClick={() => setShowSchedule(true)}
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              Lihat Jadwal
            </Button>
          </div>
          <div className="w-full flex justify-center">
            <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-sm border border-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.5 2.5a1 1 0 001.414-1.414L11 8.586V5z" clipRule="evenodd" />
              </svg>
              <span>{currentTime ? formatDateTime(currentTime) : "Memuat waktu..."}</span>
            </div>
          </div>
        </div>

        <AttendanceButton
          onSuccess={handleAttendanceSuccess}
          onError={handleAttendanceError}
          type="admin"
          isModalOpen={true}
        />
      </div>
      
      <div className="w-full max-w-md sm:max-w-lg px-3 sm:px-4 py-3 rounded-xl bg-blue-800/10 backdrop-blur-sm border border-blue-800/20 mt-2 sm:mt-4">
        <div className="flex items-center text-sm text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p>Kamera akan aktif otomatis saat halaman ini dibuka. Ambil foto dan tekan Submit untuk menyelesaikan absensi.</p>
        </div>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="w-full max-w-sm sm:max-w-2xl mx-3 sm:mx-0 transform transition-all duration-300 ease-in-out">
          <DialogHeader className="border-b border-blue-100 pb-4">
            <DialogTitle className="flex items-center text-blue-800 text-xl gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Jadwal Absensi</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 bg-blue-50/80 backdrop-blur-sm rounded-xl p-4 shadow-inner max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="sm:hidden space-y-2">
              {scheduleInfo.map((schedule) => (
                <div
                  key={schedule.day}
                  className="flex items-start justify-between rounded-lg bg-white/80 border border-blue-100 px-3 py-2"
                >
                  <div className="text-blue-800 font-semibold text-sm">
                    {schedule.day}
                  </div>
                  <div className="text-right text-xs text-blue-700">
                    {schedule.times.map((time, index) => (
                      <div key={index}>{time}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden sm:block">
              <Table>
                <TableHeader className="sticky top-0 bg-blue-50/95 backdrop-blur-sm z-10 shadow-sm">
                  <TableRow className="hover:bg-blue-100/50">
                    <TableHead className="text-blue-800 font-bold">Hari</TableHead>
                    <TableHead className="text-blue-800 font-bold">Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleInfo.map((schedule) => (
                    <TableRow key={schedule.day} className="hover:bg-blue-100/50 transition-all duration-200 ease-in-out">
                      <TableCell className="font-medium text-blue-700 whitespace-nowrap">{schedule.day}</TableCell>
                      <TableCell>
                        {schedule.times.map((time, index) => (
                          <div key={index} className="text-sm text-blue-600 py-1 flex items-center gap-2 hover:bg-blue-100/50 rounded-lg px-2 transition-all duration-200 ease-in-out group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors duration-200" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="group-hover:text-blue-700 transition-colors duration-200">{time}</span>
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
