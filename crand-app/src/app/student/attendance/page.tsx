"use client";

import React, { useState, useEffect } from "react";
import { getMonthlyAttendance, MonthlyAttendance } from "./action";
import { useSession } from "next-auth/react";

export default function AttendanceHistoryPage() {
  const { data: session } = useSession();
  const [monthlyAttendance, setMonthlyAttendance] = useState<
    MonthlyAttendance[]
  >([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMonthlyAttendance();
    }
  }, [selectedMonth, session]);

  const fetchMonthlyAttendance = async () => {
    if (!session?.user?.id) {
      console.log("No session user ID found:", session);
      return;
    }

    setIsLoading(true);
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth() + 1;
    console.log("Fetching attendance for:", {
      year,
      month,
      studentId: session.user.id,
    });
    const data = await getMonthlyAttendance(year, month, session.user.id);
    console.log("Received attendance data:", data);
    setMonthlyAttendance(data);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Sick":
        return "bg-yellow-100 text-yellow-800";
      case "Permission":
        return "bg-blue-100 text-blue-800";
      case "Holiday":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Present":
        return "Hadir";
      case "Absent":
        return "Tidak Hadir";
      case "Sick":
        return "Sakit";
      case "Permission":
        return "Izin";
      case "Holiday":
        return "Libur";
      default:
        return status;
    }
  };

  const getDaysInMonth = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth();
  const firstDayOfMonth = getFirstDayOfMonth();
  const monthName = selectedMonth.toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });
  const dayNames = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#e0e0e0] to-[#e6e6e6] p-6 space-y-8">
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <h1 className="text-3xl font-bold text-black mb-2">Rekap Absensi Bulanan</h1>
        <p className="text-black">
          Pantau riwayat kehadiran Anda per bulan di sini.
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">
            {monthName}
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedMonth(newDate);
              }}
              className="px-4 py-2 rounded-lg bg-black/10 text-black hover:bg-black/20 transition-colors"
            >
              Bulan Sebelumnya
            </button>
            <button
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedMonth(newDate);
              }}
              className="px-4 py-2 rounded-lg bg-black/10 text-black hover:bg-black/20 transition-colors"
            >
              Bulan Selanjutnya
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black/50 mx-auto"></div>
            <p className="mt-4 text-black/60">Memuat data absensi...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {monthlyAttendance.map((student) => (
              <div key={student._id} className="mb-8">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-black">
                    {student.name}
                  </h2>
                  <p className="text-black/70">Kelas: {student.class}</p>
                </div>
                <div className="grid grid-cols-7 gap-1 border border-black/10 rounded-xl overflow-hidden">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-center font-semibold py-2 bg-black/5 text-black"
                    >
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-24 bg-white" />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                    const date = new Date(
                      selectedMonth.getFullYear(),
                      selectedMonth.getMonth(),
                      dayIndex + 1
                    );
                    const attendance = student.attendance.find(
                      (a) =>
                        new Date(a.date).toDateString() === date.toDateString()
                    );
                    const isSunday = date.getDay() === 0;
                    const dayClass = isSunday ? "bg-red-50" : "bg-white";

                    return (
                      <div
                        key={dayIndex + 1}
                        className={`h-24 p-2 border border-black/5 ${dayClass} hover:bg-black/5 transition-colors`}
                      >
                        <div className="text-sm font-semibold mb-1 text-black">
                          {dayIndex + 1}
                        </div>
                        {attendance && (
                          <div className="text-xs">
                            <span
                              className={`px-2 py-1 rounded-full ${getStatusColor(
                                attendance.status
                              )}`}
                            >
                              {getStatusText(attendance.status)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {monthlyAttendance.length === 0 && (
              <div className="text-center py-6 text-black/60 italic">
                Tidak ada data absensi untuk bulan ini
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
