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
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 m-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Kehadiran</h1>
          <p className="text-gray-600">Kelola kehadiran santri di kelas Anda</p>
        </div>
        <TeacherAttendanceModal />
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Daftar Kehadiran Santri</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentTable 
            students={students} 
            onHistoryClick={handleHistoryClick}
          />
        </CardContent>
      </Card>

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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
    </div>
  );
};

export default AttendancePage;
