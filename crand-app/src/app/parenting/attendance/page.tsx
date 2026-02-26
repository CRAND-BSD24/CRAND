"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getStudentsByTeacherId, AggregatedStudentData, getAttendanceHistory, AttendanceHistory } from "./action";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { id } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SHIFT_SCHEDULES, SHIFT_TIMES } from '@/lib/shift-utils';

const StudentTable = dynamic(() => import("@/components/StudentTable"), { ssr: false });
const TeacherAttendanceModal = dynamic(() => import("@/components/TeacherAttendanceModal"), { ssr: false });

const scheduleInfo = [
  { day: "Senin", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "16:00 - 17:15"] },
  { day: "Selasa", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
  { day: "Rabu", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
  { day: "Kamis", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "16:00 - 17:15"] },
  { day: "Jumat", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
  { day: "Sabtu", times: ["04:00 - 04:45", "06:00 - 07:00"] },
  { day: "Minggu", times: ["Libur"] },
];

const getStatusBadgeStyle = (status: string) => {
  const styles = {
    Present: 'bg-blue-100 text-blue-800',
    Sick: 'bg-yellow-100 text-yellow-800',
    Permission: 'bg-blue-100 text-blue-800',
    Absent: 'bg-red-100 text-red-800'
  };
  return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status: string) => {
  const statusMap = {
    Present: 'Hadir',
    Sick: 'Sakit',
    Permission: 'Izin',
    Absent: 'Alfa'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const AttendancePage = () => {
  const [students, setStudents] = useState<AggregatedStudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AggregatedStudentData | null>(null);
  const [historyData, setHistoryData] = useState<AttendanceHistory[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showSchedule, setShowSchedule] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudentsByTeacherId();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Gagal memuat data siswa");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

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

  const handleHistoryClick = async (student: AggregatedStudentData) => {
    try {
      setLoading(true);
      const startOfCurrentWeek = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const endOfCurrentWeek = endOfWeek(currentWeek, { weekStartsOn: 1 });
      const history = await getAttendanceHistory(
        student.id,
        startOfCurrentWeek,
        endOfCurrentWeek
      );
      setHistoryData(history);
      setSelectedStudent(student);
      setShowHistory(true);
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Gagal memuat riwayat kehadiran");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = async () => {
    const newWeek = subWeeks(currentWeek, 1);
    setCurrentWeek(newWeek);
    if (selectedStudent) {
      try {
        setLoading(true);
        const weekStart = startOfWeek(newWeek, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(newWeek, { weekStartsOn: 1 });
        const history = await getAttendanceHistory(
          selectedStudent.id,
          weekStart,
          weekEnd
        );
        setHistoryData(history);
      } catch (error) {
        console.error("Error fetching history:", error);
        setError("Gagal memuat riwayat kehadiran");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNextWeek = async () => {
    const newWeek = addWeeks(currentWeek, 1);
    setCurrentWeek(newWeek);
    if (selectedStudent) {
      try {
        setLoading(true);
        const weekStart = startOfWeek(newWeek, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(newWeek, { weekStartsOn: 1 });
        const history = await getAttendanceHistory(
          selectedStudent.id,
          weekStart,
          weekEnd
        );
        setHistoryData(history);
      } catch (error) {
        console.error("Error fetching history:", error);
        setError("Gagal memuat riwayat kehadiran");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCurrentWeek = async () => {
    const newWeek = new Date();
    setCurrentWeek(newWeek);
    if (selectedStudent) {
      try {
        setLoading(true);
        const weekStart = startOfWeek(newWeek, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(newWeek, { weekStartsOn: 1 });
        const history = await getAttendanceHistory(
          selectedStudent.id,
          weekStart,
          weekEnd
        );
        setHistoryData(history);
      } catch (error) {
        console.error("Error fetching history:", error);
        setError("Gagal memuat riwayat kehadiran");
      } finally {
        setLoading(false);
      }
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#e2f6f4] flex items-center justify-center px-4 lg:pl-64 pt-16 text-red-500 font-medium">
        {error}
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
                  <p className="text-blue-600 text-sm">Kelola kehadiran santri di kelas Anda</p>
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
                <TeacherAttendanceModal />
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
                Daftar Kehadiran Santri
              </h3>
            </div>
            <div className="p-4">
              <StudentTable 
                students={students} 
                onHistoryClick={handleHistoryClick}
              />
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
              Jadwal Absensi
            </DialogTitle>
            <p className="text-sm text-blue-600 mt-2">
              Berikut adalah jadwal waktu absensi santri. Absensi ustadz tetap tanpa perubahan.
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
                          Waktu Absensi
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
                      Ustadz dapat melakukan absensi beberapa kali dalam sehari sesuai dengan slot waktu yang tersedia
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
                      Jadwal dapat berubah sesuai dengan kebijakan pesantren
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

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="w-[96vw] sm:w-auto sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3 sm:pb-4">
            <DialogTitle className="flex items-center text-blue-800 text-lg sm:text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Riwayat Kehadiran {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousWeek}
                  disabled={loading}
                  className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Minggu Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCurrentWeek}
                  disabled={loading}
                  className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Minggu Ini
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextWeek}
                  disabled={loading}
                  className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Minggu Berikutnya
                </Button>
              </div>
              <div className="text-xs sm:text-sm text-blue-700 font-medium bg-white px-3 py-1.5 rounded-full border border-blue-200">
                {format(
                  startOfWeek(currentWeek, { weekStartsOn: 1 }),
                  "dd MMMM yyyy",
                  { locale: id }
                )}{" "}
                -
                {format(
                  endOfWeek(currentWeek, { weekStartsOn: 1 }),
                  "dd MMMM yyyy",
                  { locale: id }
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 pr-0 sm:pr-2">
            <div className="border rounded-lg overflow-hidden max-h-[28rem] overflow-y-auto relative">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="bg-blue-50">
                    <TableHead className="text-blue-800 font-semibold">Tanggal</TableHead>
                    <TableHead className="text-blue-800 font-semibold">Shift</TableHead>
                    <TableHead className="text-blue-800 font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        <div className="flex items-center justify-center text-blue-700">
                          <div className="w-5 h-5 border-4 border-blue-200 border-t-blue-800 rounded-full animate-spin mr-2"></div>
                          Memuat data...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : historyData.length > 0 ? (
                    historyData.map((record) => (
                      <TableRow key={record.id} className="hover:bg-blue-50/50">
                        <TableCell className="font-medium">
                          {format(new Date(record.date), "EEEE, dd MMMM yyyy", {
                            locale: id,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {record.shift_time}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${getStatusBadgeStyle(record.status)}`}>
                            {getStatusText(record.status)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          Tidak ada riwayat kehadiran untuk minggu ini
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Weekly Summary */}
            {historyData.length > 0 && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ringkasan Mingguan
                </h4>
                
                {(() => {
                  // Calculate daily attendance summary
                  const dailySummary: Record<string, Record<string, number>> = {};
                  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
                  
                  // Initialize daily summary
                  dayNames.forEach(day => {
                    dailySummary[day] = { Hadir: 0, Sakit: 0, Izin: 0, Alfa: 0 };
                  });
                  
                  // Count attendance by day
                  historyData.forEach(record => {
                    const date = new Date(record.date);
                    const dayIndex = date.getDay();
                    const dayName = dayNames[dayIndex === 0 ? 6 : dayIndex - 1]; // Convert Sunday (0) to index 6
                    
                    const statusMap: Record<string, string> = {
                      'Present': 'Hadir',
                      'Sick': 'Sakit',
                      'Permission': 'Izin',
                      'Absent': 'Alfa'
                    };
                    
                    const mappedStatus = statusMap[record.status] || 'Alfa';
                    dailySummary[dayName][mappedStatus]++;
                  });
                  
                  // Calculate totals
                  let totalHadir = 0;
                  let totalSakit = 0;
                  let totalIzin = 0;
                  let totalAlfa = 0;
                  
                  Object.values(dailySummary).forEach(day => {
                    totalHadir += day.Hadir;
                    totalSakit += day.Sakit;
                    totalIzin += day.Izin;
                    totalAlfa += day.Alfa;
                  });
                  
                  const totalKehadiran = totalHadir + totalSakit + totalIzin + totalAlfa;
                  const persentaseKehadiran = totalKehadiran > 0 ? Math.round((totalHadir / totalKehadiran) * 100) : 0;
                  
                  return (
                    <div className="space-y-4">
                      {/* Daily Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dayNames.slice(0, 6).map(day => { // Only show Monday to Saturday
                          const dayData = dailySummary[day];
                          const hasData = Object.values(dayData).some(count => count > 0);
                          
                          if (!hasData) return null;
                          
                          return (
                            <div key={day} className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                              <div className="font-semibold text-blue-800 mb-2 flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                {day}
                              </div>
                              <div className="space-y-1 text-sm">
                                {dayData.Hadir > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Hadir</span>
                                    <span className="font-medium text-blue-800">{dayData.Hadir}x</span>
                                  </div>
                                )}
                                {dayData.Sakit > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-yellow-700">Sakit</span>
                                    <span className="font-medium text-yellow-800">{dayData.Sakit}x</span>
                                  </div>
                                )}
                                {dayData.Izin > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Izin</span>
                                    <span className="font-medium text-blue-800">{dayData.Izin}x</span>
                                  </div>
                                )}
                                {dayData.Alfa > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-red-700">Alfa</span>
                                    <span className="font-medium text-red-800">{dayData.Alfa}x</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Total Summary */}
                      <div className="bg-white rounded-lg p-4 border-2 border-blue-300 shadow-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-blue-800 text-lg mb-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              Total Mingguan
                            </h5>
                            <div className="flex flex-wrap gap-4 text-sm">
                              {totalHadir > 0 && (
                                <span className="text-blue-700 font-medium">
                                  Hadir {totalHadir}x
                                </span>
                              )}
                              {totalSakit > 0 && (
                                <span className="text-yellow-700 font-medium">
                                  Sakit {totalSakit}x
                                </span>
                              )}
                              {totalIzin > 0 && (
                                <span className="text-blue-700 font-medium">
                                  Izin {totalIzin}x
                                </span>
                              )}
                              {totalAlfa > 0 && (
                                <span className="text-red-700 font-medium">
                                  Alfa {totalAlfa}x
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-800">
                              {persentaseKehadiran}%
                            </div>
                            <div className="text-sm text-blue-600">
                              Tingkat Kehadiran
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${persentaseKehadiran}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default AttendancePage;
