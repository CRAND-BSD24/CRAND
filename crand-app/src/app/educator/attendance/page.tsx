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
  { day: "Senin", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "16:00 - 17:15"] },
  { day: "Selasa", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
  { day: "Rabu", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
  { day: "Kamis", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "16:00 - 17:15"] },
  { day: "Jumat", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
  { day: "Sabtu", times: ["04:00 - 04:45", "05:30 - 07:00", "08:00 - 09:00"] },
  { day: "Minggu", times: ["Libur"] },
];

const getStatusBadgeStyle = (status: string) => {
  const styles = {
    Present: "bg-green-100 text-green-800",
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
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-800 rounded-full animate-spin mb-4"></div>
          <div className="text-emerald-800 text-base font-medium">Loading data...</div>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-700 text-white rounded-lg mr-3">
                <span className="font-bold">Absensi</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-emerald-800">Absensi Santri</h1>
                <p className="text-emerald-600 text-sm">
                  Kelola kehadiran santri di kelas Anda
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={() => setShowSchedule(true)}
            >
              Lihat Jadwal Sholat & Muhadhoroh
            </Button>
          </div>

          <Card className="bg-white rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-800">Daftar Santri</CardTitle>
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
                      <h3 className="font-bold text-emerald-800">
                        {selectedStudent.name}
                      </h3>
                      <p className="text-emerald-600 text-sm">
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

                <div className="rounded-lg border border-emerald-100 overflow-hidden">
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
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Jadwal Sholat & Muhadhoroh</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {scheduleInfo.map((item, idx) => (
                  <div key={idx} className="bg-emerald-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-emerald-800 mb-2">{item.day}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.times.map((time, i) => (
                        <div key={i} className="text-sm text-emerald-700">{time}</div>
                      ))}
                    </div>
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