"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const StaffAttendanceModal = dynamic(() => import("@/components/StaffAttendanceModal"), { ssr: false });

const scheduleInfo = [
  { day: "Senin", times: ["08:00 - 16:30"] },
  { day: "Selasa", times: ["08:00 - 16:30"] },
  { day: "Rabu", times: ["08:00 - 16:30"] },
  { day: "Kamis", times: ["08:00 - 16:30"] },
  { day: "Jumat", times: ["08:00 - 16:30"] },
  { day: "Sabtu", times: ["08:00 - 16:30"] },
  { day: "Minggu", times: ["Libur"] },
];

const StaffAttendancePage = () => {
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  // Dummy history data
  const historyData = [
    { date: "2024-02-25", time: "07:55", status: "Present", shift: "Pagi" },
    { date: "2024-02-24", time: "07:58", status: "Present", shift: "Pagi" },
    { date: "2024-02-23", time: "08:05", status: "Late", shift: "Pagi" },
    { date: "2024-02-22", time: "07:50", status: "Present", shift: "Pagi" },
    { date: "2024-02-21", time: "-", status: "Sick", shift: "Pagi" },
  ];

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-blue-100 text-blue-800";
      case "Sick":
        return "bg-yellow-100 text-yellow-800";
      case "Permission":
        return "bg-blue-100 text-blue-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Late":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Present":
        return "Hadir";
      case "Sick":
        return "Sakit";
      case "Permission":
        return "Izin";
      case "Absent":
        return "Alfa";
      case "Late":
        return "Terlambat";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e2f6f4] flex items-center justify-center px-4 lg:pl-64 pt-16">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-800 rounded-full animate-spin mb-4"></div>
          <div className="text-blue-800 text-base font-medium">Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#e2f6f4] pt-16">
      <div className="lg:pl-1">
        <div className="pl-4 pr-4 sm:pl-6 lg:pl-8">
          <div className="flex flex-col gap-3 mb-5 bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center">
                <div className="p-2 bg-blue-700 text-white rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-blue-800">Manajemen Kehadiran</h1>
                  <p className="text-blue-600 text-sm">Kelola absensi harian Anda</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  onClick={() => setShowSchedule(true)}
                  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  Lihat Jadwal
                </Button>
                <StaffAttendanceModal />
              </div>
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

          <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-blue-800 flex items-center">
                <div className="w-1 h-5 bg-blue-600 rounded-full mr-2"></div>
                Riwayat Absensi
              </h3>
            </div>
            <div className="p-4">
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Waktu Masuk</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                        <TableCell>{record.shift}</TableCell>
                        <TableCell>{record.time}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeStyle(record.status)}`}>
                            {getStatusText(record.status)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="space-y-3 md:hidden">
                {historyData.map((record, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-blue-100 bg-white shadow-sm p-3 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-blue-900 text-sm">
                          {formatDate(record.date)}
                        </span>
                        <span className="text-xs text-slate-600">
                          Shift {record.shift}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-[11px] ${getStatusBadgeStyle(
                          record.status
                        )}`}
                      >
                        {getStatusText(record.status)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>Waktu Masuk:</span>
                      <span className="text-blue-600 font-medium">
                        {record.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="w-[96vw] sm:w-auto sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="border-b pb-4 flex-shrink-0">
            <DialogTitle className="flex items-center text-blue-800 text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Jadwal Absensi Staff
            </DialogTitle>
            <p className="text-sm text-blue-600 mt-2">
              Berikut adalah jadwal waktu kerja staff.
            </p>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="overflow-x-auto rounded-lg border border-blue-200 bg-white shadow-sm">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="bg-blue-600 hover:bg-blue-600">
                      <TableHead className="text-white font-bold text-base py-4">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Hari
                        </div>
                      </TableHead>
                      <TableHead className="text-white font-bold text-base py-4">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Waktu Kerja
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleInfo.map((schedule, scheduleIndex) => (
                      <TableRow 
                        key={schedule.day} 
                        className={`hover:bg-blue-50/70 transition-all duration-200 ${
                          scheduleIndex % 2 === 0 ? 'bg-white' : 'bg-blue-25'
                        }`}
                      >
                        <TableCell className="font-semibold text-blue-800 py-6 border-r border-blue-100">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              schedule.day === 'Minggu' ? 'bg-red-400' : 'bg-blue-400'
                            }`}></div>
                            <span className="text-lg">{schedule.day}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="space-y-2">
                            {schedule.times.map((time, index) => (
                              <div key={index} className="flex items-center">
                                <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md ${
                                  time === 'Libur' 
                                    ? 'bg-red-100 text-red-800 border border-red-200' 
                                    : 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
                                }`}>
                                  {time === 'Libur' ? (
                                    <>
                                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                      {time}
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      </svg>
                                      {time}
                                    </>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Catatan Penting</h4>
                    <p className="text-sm text-blue-700">
                      Staff diharapkan hadir tepat waktu sesuai jadwal yang telah ditentukan.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">Perhatian</h4>
                    <p className="text-sm text-amber-700">
                      Keterlambatan lebih dari 15 menit akan dicatat sebagai indisipliner.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4 flex-shrink-0">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowSchedule(false)}
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 px-6 py-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default StaffAttendancePage;
