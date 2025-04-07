"use client";

import React, { useState, useEffect } from "react";
import { getMonthlyAttendance, MonthlyAttendance } from "./action";

export default function AttendanceHistoryPage() {
  const [monthlyAttendance, setMonthlyAttendance] = useState<
    MonthlyAttendance[]
  >([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [selectedMonth]);

  const fetchMonthlyAttendance = async () => {
    setIsLoading(true);
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth() + 1;
    const studentId = "1"; // Ganti dengan studentId yang sesuai dari sesi login
    const data = await getMonthlyAttendance(year, month, studentId);
    setMonthlyAttendance(data);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "sick":
        return "bg-yellow-100 text-yellow-800";
      case "permission":
        return "bg-blue-100 text-blue-800";
      case "holiday":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "present":
        return "Hadir";
      case "absent":
        return "Tidak Hadir";
      case "sick":
        return "Sakit";
      case "permission":
        return "Izin";
      case "holiday":
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
    <div className="min-h-screen bg-[#9ACBD0] flex flex-col items-center px-4 py-10">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-7xl border border-[#48A6A7]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#006A71]">
            Rekap Absensi Bulanan
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedMonth(newDate);
              }}
              className="p-2 rounded-lg bg-[#48A6A7] text-white hover:bg-[#3d9395]"
            >
              Bulan Sebelumnya
            </button>
            <span className="text-xl font-semibold text-[#004D4D]">
              {monthName}
            </span>
            <button
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedMonth(newDate);
              }}
              className="p-2 rounded-lg bg-[#48A6A7] text-white hover:bg-[#3d9395]"
            >
              Bulan Selanjutnya
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#48A6A7] mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data absensi...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {monthlyAttendance.map((student) => (
              <div key={student._id} className="mb-8">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-[#02676C]">
                    {student.name}
                  </h2>
                  <p className="text-gray-600">Kelas: {student.class}</p>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-center font-semibold py-2 bg-[#B5DAD6] text-[#004D4D] rounded-t-lg"
                    >
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-24" />
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
                        className={`h-24 p-2 border border-gray-200 ${dayClass}`}
                      >
                        <div className="text-sm font-semibold mb-1">
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
              <div className="text-center py-6 text-gray-500">
                Tidak ada data absensi untuk bulan ini
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
