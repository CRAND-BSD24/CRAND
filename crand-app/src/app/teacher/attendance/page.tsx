"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getStudentsByTeacherId, AggregatedStudentData, getAttendanceHistory, AttendanceHistory } from "./action";
import StudentTable from "@/components/StudentTable";
import TeacherAttendanceModal from "@/components/TeacherAttendanceModal";
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

const AttendancePage = () => {
  const [students, setStudents] = useState<AggregatedStudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AggregatedStudentData | null>(null);
  const [historyData, setHistoryData] = useState<AttendanceHistory[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());

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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-emerald-800">Manajemen Kehadiran</h1>
                <p className="text-emerald-600 text-sm">Kelola kehadiran santri di kelas Anda</p>
              </div>
            </div>
            <TeacherAttendanceModal />
          </div>

          <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-emerald-800 flex items-center">
                <div className="w-1 h-5 bg-emerald-600 rounded-full mr-2"></div>
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

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Riwayat Kehadiran {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
                disabled={loading}
              >
                Minggu Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCurrentWeek}
                disabled={loading}
              >
                Minggu Ini
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextWeek}
                disabled={loading}
              >
                Minggu Berikutnya
              </Button>
            </div>
            <div className="text-sm text-gray-500">
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
          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-800 rounded-full animate-spin"></div>
              </div>
            ) : historyData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Waktu Input</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.date), "dd MMMM yyyy", {
                          locale: id,
                        })}
                      </TableCell>
                      <TableCell>{record.status}</TableCell>
                      <TableCell>
                        {format(new Date(record.created_at), "dd MMMM yyyy HH:mm", {
                          locale: id,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex justify-center items-center h-32 text-gray-500">
                Tidak ada riwayat kehadiran di minggu ini
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default AttendancePage;
