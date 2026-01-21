"use client";

import React, { useState, useEffect } from "react";
import { getMonthlyAttendance, MonthlyAttendance, getAttendanceHistory, AttendanceHistory } from "./action";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { id } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StudentInfo {
  name: string;
  class: string;
}

interface AttendanceWithPhoto {
  date: Date;
  status: "" | "Hadir" | "Alfa" | "Sakit" | "Izin";
  timestamp?: string;
  shift_time?: string;
  id?: string;
}

function getWeeklySummary(data: AttendanceWithPhoto[]) {
  const summary = {
    'Hadir': 0,
    'Sakit': 0,
    'Izin': 0,
    'Alfa': 0
  };

  data.forEach(attendance => {
    const status = getStatusText(attendance.status.trim());
    if (status in summary) {
      summary[status as keyof typeof summary]++;
    }
  });

  return summary;
}

function calculateAttendancePercentage(data: AttendanceWithPhoto[]) {
  if (data.length === 0) return 0;

  const totalAttendance = data.length;
  const presentCount = data.filter(a => getStatusText(a.status.trim()) === 'Hadir').length;

  return Math.round((presentCount / totalAttendance) * 100);
}

function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'Present': 'Hadir',
    'Absent': 'Alfa',
    'Sick': 'Sakit',
    'Permission': 'Izin',
    'Holiday': 'Libur',
    'Hadir': 'Hadir',
    'Alfa': 'Alfa',
    'Sakit': 'Sakit',
    'Izin': 'Izin'
  };
  return statusMap[status.trim()] || status;
}

function getStatusColor(status: string): string {
  const colorMap: { [key: string]: string } = {
    'Present': 'bg-emerald-100 text-emerald-800',
    'Absent': 'bg-red-100 text-red-800',
    'Sick': 'bg-yellow-100 text-yellow-800',
    'Permission': 'bg-blue-100 text-blue-800',
    'Holiday': 'bg-purple-100 text-purple-800',
    'Hadir': 'bg-emerald-100 text-emerald-800',
    'Alfa': 'bg-red-100 text-red-800',
    'Sakit': 'bg-yellow-100 text-yellow-800',
    'Izin': 'bg-blue-100 text-blue-800'
  };
  return colorMap[status.trim()] || 'bg-gray-100 text-gray-800';
}

export default function AttendanceHistoryPage() {
  const { data: session } = useSession();

  const [historyData, setHistoryData] = useState<AttendanceWithPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
          const endDate = endOfWeek(currentWeek, { weekStartsOn: 1 });
          
          const weeklyData = await getAttendanceHistory(session.user.id, startDate, endDate);
          setHistoryData(weeklyData.map(record => ({
            ...record,
            status: record.status === "Present" ? "Hadir" :
                   record.status === "Sick" ? "Sakit" :
                   record.status === "Permission" ? "Izin" :
                   record.status === "Absent" ? "Alfa" :
                   record.status === "Holiday" ? "" : ""
          })));

          // Fetch student info if not already set
          if (!studentInfo) {
            const monthData = await getMonthlyAttendance(
              startDate.getFullYear(),
              startDate.getMonth() + 1,
              session.user.id
            );
            if (monthData[0]) {
              setStudentInfo({
                name: monthData[0].name,
                class: monthData[0].class || ''
              });
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [currentWeek, session, studentInfo]);

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const handleCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const fetchWeeklyAttendance = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const endDate = endOfWeek(currentWeek, { weekStartsOn: 1 });
    
    try {
      const weeklyData = await getAttendanceHistory(
        session.user.id,
        startDate,
        endDate
      );

      // Add unique IDs to the records
      const weeklyDataWithIds = weeklyData.map((record, index) => ({
        ...record,
        id: `${record.date}-${index}`
      }));

      setHistoryData(weeklyDataWithIds.map(record => ({
        ...record,
        status: record.status === "Present" ? "Hadir" :
               record.status === "Sick" ? "Sakit" :
               record.status === "Permission" ? "Izin" :
               record.status === "Absent" ? "Alfa" :
               record.status === "Holiday" ? "" : ""
      })));

      // Fetch student info if not already set
      if (!studentInfo) {
        const monthData = await getMonthlyAttendance(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          session.user.id
        );
        if (monthData[0]) {
          setStudentInfo({
            name: monthData[0].name,
            class: monthData[0].class || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching weekly attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 space-y-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/20 shadow-xl space-y-6 hover:shadow-emerald-100/20 transition-all duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">Riwayat Kehadiran</h1>
              {studentInfo && (
                <div className="space-y-1">
                  <p className="text-lg font-medium text-emerald-700">{studentInfo.name}</p>
                  <p className="text-emerald-600/70 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    Kelas: {studentInfo.class}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 bg-emerald-50/50 backdrop-blur-sm rounded-lg p-2 border border-emerald-100/30 shadow-sm w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
                disabled={loading}
                className="bg-white/80 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:shadow-sm transition-all duration-200 backdrop-blur-sm w-full md:w-auto text-xs md:text-sm whitespace-nowrap"
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
                className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 w-full md:w-auto text-xs md:text-sm whitespace-nowrap"
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
                className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 w-full md:w-auto text-xs md:text-sm whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Minggu Berikutnya
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-600 absolute top-0 left-0"></div>
              </div>
            </div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-8 px-4 bg-emerald-50/30 rounded-xl border border-emerald-100/20 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-emerald-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-emerald-600 font-medium">Tidak ada data kehadiran untuk minggu ini</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white/80 rounded-xl shadow-sm overflow-hidden border border-emerald-100/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50/50 hover:bg-emerald-50/70 transition-colors duration-200">
                        <TableHead className="text-emerald-700 font-semibold whitespace-nowrap">Tanggal</TableHead>
                        <TableHead className="text-emerald-700 font-semibold whitespace-nowrap">Shift</TableHead>
                        <TableHead className="text-emerald-700 font-semibold whitespace-nowrap">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.map((attendance, index) => (
                        <TableRow key={index} className="hover:bg-emerald-50/30 transition-colors duration-200">
                          <TableCell className="font-medium text-emerald-800">
                            {new Date(attendance.date).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-emerald-600">
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {attendance.shift_time}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(attendance.status)} shadow-sm`}>
                              {getStatusText(attendance.status)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-6 shadow-sm space-y-4 border border-emerald-100/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Ringkasan Mingguan
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(getWeeklySummary(historyData)).map(([status, count]) => (
                    <div
                      key={status}
                      className="bg-gradient-to-br from-white to-emerald-50/50 rounded-lg p-4 border border-emerald-100/20 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm"
                    >
                      <div className="text-sm text-emerald-600 font-medium">{status}</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{count}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-emerald-50/50 rounded-lg p-4 border border-emerald-100/20">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Persentase Kehadiran
                    </span>
                    <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {calculateAttendancePercentage(historyData)}%
                    </span>
                  </div>
                  <div className="h-3 bg-emerald-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${calculateAttendancePercentage(historyData)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/80 backdrop-blur-sm border-emerald-100/20">
          <DialogHeader className="border-b border-emerald-100/20 pb-4">
            <DialogTitle className="flex items-center text-xl">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Riwayat Kehadiran Mingguan
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="bg-emerald-50/50 backdrop-blur-sm rounded-lg p-4 mb-4 border border-emerald-100/20 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousWeek}
                  disabled={loading}
                  className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
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
                  className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
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
                  className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Minggu Berikutnya
                </Button>
              </div>
              <div className="text-sm text-emerald-700 font-medium bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm w-full md:w-auto text-center">
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
        </DialogContent>
      </Dialog>
    </>
  );
}
