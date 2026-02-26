"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getStudentsForEducator, AggregatedStudentData } from "@/app/educator/attendance/action";
import { getAttendanceHistory, AttendanceHistory } from "@/app/teacher/attendance/action";
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

import { SHIFT_SCHEDULES, SHIFT_TIMES } from "@/lib/shift-utils";

const StudentTable = dynamic(() => import("@/components/StudentTable"), { ssr: false });
const TeacherAttendanceModal = dynamic(() => import("@/components/TeacherAttendanceModal"), { ssr: false });

const scheduleInfo = [
  { day: "Senin", times: ["09:15 - 10:00 (Jam 1)", "10:00 - 10:45 (Jam 2)", "11:00 - 11:45 (Jam 3)", "11:45 - 12:30 (Jam 4)"] },
  { day: "Selasa", times: ["09:15 - 10:00 (Jam 1)", "10:00 - 10:45 (Jam 2)", "11:00 - 11:45 (Jam 3)", "11:45 - 12:30 (Jam 4)"] },
  { day: "Rabu", times: ["09:15 - 10:00 (Jam 1)", "10:00 - 10:45 (Jam 2)", "11:00 - 11:45 (Jam 3)", "11:45 - 12:30 (Jam 4)"] },
  { day: "Kamis", times: ["09:15 - 10:00 (Jam 1)", "10:00 - 10:45 (Jam 2)", "11:00 - 11:45 (Jam 3)", "11:45 - 12:30 (Jam 4)"] },
  { day: "Jumat", times: ["09:15 - 10:00 (Jam 1)", "10:00 - 10:45 (Jam 2)", "11:00 - 11:45 (Jam 3)", "11:45 - 12:30 (Jam 4)"] },
  { day: "Sabtu", times: ["09:15 - 10:00 (Jam 1)", "10:00 - 10:45 (Jam 2)", "11:00 - 11:45 (Jam 3)", "11:45 - 12:30 (Jam 4)"] },
  { day: "Minggu", times: ["Libur"] },
];

const getStatusBadgeStyle = (status: string) => {
  const styles = {
    Present: "bg-blue-100 text-blue-800",
    Sick: "bg-yellow-100 text-yellow-800",
    Permission: "bg-blue-100 text-blue-800",
    Absent: "bg-red-100 text-red-800",
  };
  return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
};

const getStatusText = (status: string) => {
  const statusMap = {
    Present: "Hadir",
    Sick: "Sakit",
    Permission: "Izin",
    Absent: "Alfa",
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

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudentsForEducator();
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
                <TeacherAttendanceModal role="educator" />
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

          <Card className="bg-white rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Daftar Santri</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentTable students={students} onHistoryClick={handleHistoryClick} role="educator" />
            </CardContent>
          </Card>

          {/* History Dialog */}
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Riwayat Kehadiran</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedStudent && (
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-blue-800">
                        {selectedStudent.name}
                      </h3>
                      <p className="text-blue-600 text-sm">
                        Kelas: {selectedStudent.class_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                        Minggu Sebelumnya
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCurrentWeek}>
                        Minggu Ini
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleNextWeek}>
                        Minggu Berikutnya
                      </Button>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-blue-100 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{format(new Date(item.date), "EEEE, d MMMM yyyy", { locale: id })}</TableCell>
                          <TableCell>{item.shift_time || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(item.status)}`}>
                              {getStatusText(item.status)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Schedule Dialog */}
          <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full">
              <DialogHeader>
                <DialogTitle>Jadwal Mengajar</DialogTitle>
              </DialogHeader>
              
              {/* Desktop & Tablet View (Table) - Visible on md and up */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-blue-100">
                  <Table className="min-w-[640px]">
                    <TableHeader className="bg-blue-50">
                    <TableRow>
                      <TableHead className="w-[150px] font-bold text-blue-800">Hari</TableHead>
                      <TableHead className="font-bold text-blue-800">Jam 1</TableHead>
                      <TableHead className="font-bold text-blue-800">Jam 2</TableHead>
                      <TableHead className="font-bold text-blue-800">Jam 3</TableHead>
                      <TableHead className="font-bold text-blue-800">Jam 4</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleInfo.map((item, idx) => (
                      <TableRow key={idx} className="hover:bg-blue-50/50 transition-colors">
                        <TableCell className="font-medium text-blue-900 bg-blue-50/30">{item.day}</TableCell>
                        {item.day === "Minggu" ? (
                          <TableCell colSpan={4} className="text-center text-red-500 font-medium bg-red-50">Libur</TableCell>
                        ) : (
                          <>
                            {[0, 1, 2, 3].map((i) => {
                              // Extract time part only (e.g. "09:15 - 10:00") from "09:15 - 10:00 (Jam 1)"
                              const timeStr = item.times[i] || "-";
                              const timeOnly = timeStr.split('(')[0].trim();
                              return (
                                <TableCell key={i}>
                                  <div className="bg-white border border-blue-100 rounded-md px-2 lg:px-3 py-2 text-sm text-center shadow-sm text-blue-700 whitespace-nowrap">
                                    {timeOnly}
                                  </div>
                                </TableCell>
                              );
                            })}
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View (Cards) - Visible on small screens */}
              <div className="md:hidden space-y-4">
                {scheduleInfo.map((item, idx) => (
                  <div key={idx} className="bg-white border border-blue-100 rounded-xl shadow-sm overflow-hidden">
                    <div className={`px-4 py-3 font-bold flex justify-between items-center ${
                      item.day === "Minggu" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-800"
                    }`}>
                      <span>{item.day}</span>
                      {item.day === "Minggu" && <span className="text-xs bg-red-100 px-2 py-1 rounded-full">Libur</span>}
                    </div>
                    {item.day !== "Minggu" && (
                      <div className="p-4 grid grid-cols-1 gap-3">
                        {item.times.map((time, i) => (
                          <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-3 shrink-0">
                              {i + 1}
                            </div>
                            <span className="text-sm text-gray-700 font-medium">{time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </main>
  );
};

export default AttendancePage;
