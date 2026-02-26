"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getAttendanceRecordsByRole,
  removeAttendancePhotos,
  AttendanceRecord,
  getTeacherRoles,
  getUserNamesByRoles,
  getTeacherLeavesForHistory,
  TeacherLeaveForHistory,
} from "@/app/admin/attendance/action";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TabType = "admin" | "guru" | "kbm" | "staff" | "kepengasuhan" | "manajer";

type ScheduleItem = { day: string; times: string[] };

const scheduleByTab: Record<TabType, ScheduleItem[]> = {
  admin: [
    { day: "Senin", times: ["08:00 - 16:30"] },
    { day: "Selasa", times: ["08:00 - 16:30"] },
    { day: "Rabu", times: ["08:00 - 16:30"] },
    { day: "Kamis", times: ["08:00 - 16:30"] },
    { day: "Jumat", times: ["08:00 - 16:30"] },
    { day: "Sabtu", times: ["08:00 - 16:30"] },
    { day: "Minggu", times: ["Libur"] },
  ],
  manajer: [
    { day: "Senin", times: ["08:00 - 16:30"] },
    { day: "Selasa", times: ["08:00 - 16:30"] },
    { day: "Rabu", times: ["08:00 - 16:30"] },
    { day: "Kamis", times: ["08:00 - 16:30"] },
    { day: "Jumat", times: ["08:00 - 16:30"] },
    { day: "Sabtu", times: ["08:00 - 16:30"] },
    { day: "Minggu", times: ["Libur"] },
  ],
  guru: [
    { day: "Senin", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "16:00 - 17:15"] },
    { day: "Selasa", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
    { day: "Rabu", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
    { day: "Kamis", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "16:00 - 17:15"] },
    { day: "Jumat", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
    { day: "Sabtu", times: ["04:00 - 04:45", "06:00 - 07:00"] },
    { day: "Minggu", times: ["Libur"] },
  ],
  kbm: [
    { day: "Senin", times: ["09:15 - 10:00", "10:00 - 10:45", "11:00 - 11:45", "11:45 - 12:30"] },
    { day: "Selasa", times: ["09:15 - 10:00", "10:00 - 10:45", "11:00 - 11:45", "11:45 - 12:30"] },
    { day: "Rabu", times: ["09:15 - 10:00", "10:00 - 10:45", "11:00 - 11:45", "11:45 - 12:30"] },
    { day: "Kamis", times: ["09:15 - 10:00", "10:00 - 10:45", "11:00 - 11:45", "11:45 - 12:30"] },
    { day: "Jumat", times: ["09:15 - 10:00", "10:00 - 10:45", "11:00 - 11:45", "11:45 - 12:30"] },
    { day: "Sabtu", times: ["09:15 - 10:00", "10:00 - 10:45", "11:00 - 11:45", "11:45 - 12:30"] },
    { day: "Minggu", times: ["Libur"] },
  ],
  staff: [
    { day: "Senin", times: ["08:00 - 16:30"] },
    { day: "Selasa", times: ["08:00 - 16:30"] },
    { day: "Rabu", times: ["08:00 - 16:30"] },
    { day: "Kamis", times: ["08:00 - 16:30"] },
    { day: "Jumat", times: ["08:00 - 16:30"] },
    { day: "Sabtu", times: ["08:00 - 16:30"] },
    { day: "Minggu", times: ["Libur"] },
  ],
  kepengasuhan: [
    { day: "Senin", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "16:00 - 17:15"] },
    { day: "Selasa", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
    { day: "Rabu", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
    { day: "Kamis", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "16:00 - 17:15"] },
    { day: "Jumat", times: ["04:00 - 04:45", "06:00 - 07:00", "08:00 - 09:00", "18:30 - 20:00"] },
    { day: "Sabtu", times: ["04:00 - 04:45", "06:00 - 07:00"] },
    { day: "Minggu", times: ["Libur"] },
  ],
};

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [teacherLeaves, setTeacherLeaves] = useState<TeacherLeaveForHistory[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("admin");
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [filterName, setFilterName] = useState<string>("");
  const [teacherRoles, setTeacherRoles] = useState<{ name: string; role: string }[]>([]);
  const [adminNames, setAdminNames] = useState<string[]>([]);
  const [staffNames, setStaffNames] = useState<string[]>([]);
  const [kepengasuhanNames, setKepengasuhanNames] = useState<string[]>([]);
  const [managerNames, setManagerNames] = useState<string[]>([]);
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAttendanceRecords = useCallback(async () => {
    try {
      let role = "admin";
      if (activeTab === "guru") role = "teacher";
      else if (activeTab === "kbm") role = "educator";
      else if (activeTab === "staff") role = "staff";
      else if (activeTab === "kepengasuhan") role = "parenting";
      else if (activeTab === "manajer") role = "manager";
      
      const data = await getAttendanceRecordsByRole(role);
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  }, [activeTab]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchAttendanceRecords();
      setIsLoading(false);
    };
    load();
  }, [fetchAttendanceRecords]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [teacherRoleItems, adminUserNames, staffUserNames, kepUserNames, mgrNames] =
          await Promise.all([
            getTeacherRoles(),
            getUserNamesByRoles(["admin"]),
            getUserNamesByRoles(["staff"]),
            getUserNamesByRoles(["parenting"]),
            getUserNamesByRoles(["manager"]),
          ]);

        setTeacherRoles(
          teacherRoleItems.map(item => ({
            name: item.name,
            role: item.role,
          }))
        );
        setAdminNames(adminUserNames);
        setStaffNames(staffUserNames);
        setKepengasuhanNames(kepUserNames);
        setManagerNames(mgrNames);
      } catch (error) {
        console.error("Error fetching users for attendance:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const leaves = await getTeacherLeavesForHistory();
        setTeacherLeaves(leaves);
      } catch (error) {
        console.error("Error fetching teacher leaves for history:", error);
      }
    };

    fetchLeaves();
  }, []);

  const teacherRoleLookup = useMemo(() => {
    const map = new Map<string, string>();
    teacherRoles.forEach(item => {
      if (item.name && item.role) {
        map.set(item.name, item.role);
      }
    });
    return map;
  }, [teacherRoles]);

  const getRecordsForCurrentTab = () => {
    return records;
  };

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);

  const getMonthName = (year: number, monthIndex: number) =>
    new Date(year, monthIndex, 1).toLocaleString("id-ID", {
      month: "long",
    });

  const filterRecordsForMonth = (records: AttendanceRecord[]) => {
    return records.filter(record => {
      if (!record.date) return false;
      const recordDate = new Date(record.date);
      const isSameMonth =
        recordDate.getFullYear() === selectedYear &&
        recordDate.getMonth() === selectedMonth;

      if (!isSameMonth) {
        return false;
      }

      if (activeTab === "admin" && adminNames.length > 0 && !adminNames.includes(record.name)) {
        return false;
      }

      if (activeTab === "staff" && staffNames.length > 0 && !staffNames.includes(record.name)) {
        return false;
      }

      if (activeTab === "kepengasuhan" && kepengasuhanNames.length > 0 && !kepengasuhanNames.includes(record.name)) {
        return false;
      }

      if (activeTab === "manajer" && managerNames.length > 0 && !managerNames.includes(record.name)) {
        return false;
      }

      return true;
    });
  };

  const recordsForCurrentTabAndMonth = filterRecordsForMonth(
    getRecordsForCurrentTab()
  );

  const baseNamesForCurrentTab = useMemo(() => {
    if (activeTab === "admin") {
      return adminNames;
    }
    if (activeTab === "staff") {
      return staffNames;
    }
    if (activeTab === "kepengasuhan") {
      return kepengasuhanNames;
    }
    if (activeTab === "manajer") {
      return managerNames;
    }
    const guruNames = teacherRoles
      .filter(item => item.role === "teacher")
      .map(item => item.name);
    const kbmNames = teacherRoles
      .filter(item => item.role === "educator")
      .map(item => item.name);
    if (activeTab === "guru") {
      return guruNames;
    }
    return kbmNames;
  }, [activeTab, adminNames, staffNames, kepengasuhanNames, managerNames, teacherRoles]);

  const allNamesForCurrentTab = useMemo(() => {
    const namesFromRecords = recordsForCurrentTabAndMonth.map(record => record.name);
    const combined = Array.from(
      new Set([...baseNamesForCurrentTab, ...namesFromRecords])
    );
    return combined;
  }, [baseNamesForCurrentTab, recordsForCurrentTabAndMonth]);

  const filteredNames = filterName
    ? allNamesForCurrentTab.filter(name =>
        name.toLowerCase().includes(filterName.toLowerCase())
      )
    : allNamesForCurrentTab;

  const uniqueNames = filteredNames.sort((a, b) => a.localeCompare(b));

  const attendanceMap = new Map<string, AttendanceRecord>();

  recordsForCurrentTabAndMonth.forEach(record => {
    if (!record.date) return;
    const recordDate = new Date(record.date);
    const day = recordDate.getDate();
    const key = `${record.name}-${day}`;
    if (!attendanceMap.has(key)) {
      attendanceMap.set(key, record);
    }
  });

  const getApprovedLeaveForCell = (name: string, day: number) => {
    return teacherLeaves.find(leave => {
      if (leave.status !== "approved") return false;
      if (leave.teacher_name !== name) return false;
      const leaveDate = new Date(leave.date);
      if (
        leaveDate.getFullYear() !== selectedYear ||
        leaveDate.getMonth() !== selectedMonth ||
        leaveDate.getDate() !== day
      ) {
        return false;
      }
      return true;
    });
  };

  const getTotalLateMinutesForName = (name: string): number => {
    return recordsForCurrentTabAndMonth.reduce((sum, record) => {
      if (record.name !== name) return sum;
      const lateMinutes = record.is_late ? record.late_minutes || 0 : 0;
      return sum + lateMinutes;
    }, 0);
  };

  const getTotalAttendanceForName = (name: string): number => {
    return recordsForCurrentTabAndMonth.reduce((sum, record) => {
      if (record.name !== name) return sum;
      const statusValue = (record.status || "").toLowerCase();
      if (statusValue === "permission" || statusValue === "izin") {
        return sum;
      }
      return sum + 1;
    }, 0);
  };

  const getTimesForCell = (name: string, day: number): string[] => {
    const times: string[] = [];

    recordsForCurrentTabAndMonth.forEach(record => {
      if (!record.date) return;
      if (record.name !== name) return;
      const recordDate = new Date(record.date);
      if (recordDate.getDate() !== day) return;
      times.push(
        recordDate.toLocaleString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    });

    return times;
  };

  type CellStatus = "on_time" | "late" | "absent" | "excused" | "none";

  const getCellStatus = (
    record: AttendanceRecord | undefined,
    day: number,
    hasApprovedLeave: boolean
  ): CellStatus => {
    const isCurrentMonth =
      selectedYear === today.getFullYear() &&
      selectedMonth === today.getMonth();

    if (isCurrentMonth) {
      const todayDate = today.getDate();
      if (day > todayDate) {
        return "none";
      }
    }

    if (!record) {
      if (hasApprovedLeave) {
        return "excused";
      }
      return "absent";
    }
    const statusValue = (record.status || "").toLowerCase();
    if (
      statusValue === "sick" ||
      statusValue === "permission" ||
      statusValue === "izin" ||
      statusValue === "sakit"
    ) {
      return "excused";
    }
    const lateMinutes = record.late_minutes || 0;
    if (record.is_late && lateMinutes > 10) {
      return "late";
    }
    return "on_time";
  };

  const getStatusClassName = (status: CellStatus) => {
    switch (status) {
      case "on_time":
        return "bg-blue-500 text-white";
      case "late":
        return "bg-yellow-400 text-white";
      case "excused":
        return "bg-orange-500 text-white";
      case "absent":
        return "bg-red-500 text-white";
      case "none":
      default:
        return "bg-gray-100 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 to-teal-50 flex flex-col items-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="bg-white mt-13 shadow-2xl rounded-2xl p-4 sm:p-8 w-full max-w-md md:max-w-4xl border-t-4 border-blue-800 transition-all duration-300 hover:shadow-blue-200/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 flex items-center gap-2 sm:gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
              </svg>
              Riwayat Absensi
            </h2>
            <Button
              variant="outline"
              onClick={() => setShowSchedule(true)}
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              Lihat Jadwal
            </Button>
          </div>
          <Link
            href="/hrd/attendance"
            className="bg-blue-800 text-white py-2 px-3 sm:px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 shadow-md transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Absensi
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filter berdasarkan nama..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-wrap mb-6 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab("admin");
            }}
            className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
              activeTab === "admin"
                ? "text-blue-800 border-b-2 border-blue-800"
                : "text-gray-500 hover:text-blue-700"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Admin
          </button>
          <button
            onClick={() => {
              setActiveTab("guru");
            }}
            className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
              activeTab === "guru"
                ? "text-blue-800 border-b-2 border-blue-800"
                : "text-gray-500 hover:text-blue-700"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Guru
          </button>
          <button
            onClick={() => {
              setActiveTab("kbm");
            }}
            className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
              activeTab === "kbm"
                ? "text-blue-800 border-b-2 border-blue-800"
                : "text-gray-500 hover:text-blue-700"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 00-2 2v9.5A1.5 1.5 0 003.5 16H9v-2H4V5h12v5h2V5a2 2 0 00-2-2H4z" />
              <path d="M14 12a2 2 0 00-2 2v4h2v-4h4v-2h-4z" />
            </svg>
            KBM
          </button>
          <button
            onClick={() => {
              setActiveTab("staff");
            }}
            className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
              activeTab === "staff"
                ? "text-blue-800 border-b-2 border-blue-800"
                : "text-gray-500 hover:text-blue-700"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 6a3 3 0 116 0 3 3 0 01-6 0z" />
              <path d="M4 14a4 4 0 018 0v2H4v-2z" />
              <path d="M15 11a2 2 0 110 4h-1v-1a4 4 0 00-1.528-3.124A3.001 3.001 0 0115 11z" />
            </svg>
            Staff
          </button>
          <button
            onClick={() => {
              setActiveTab("kepengasuhan");
            }}
            className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
              activeTab === "kepengasuhan"
                ? "text-blue-800 border-b-2 border-blue-800"
                : "text-gray-500 hover:text-blue-700"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a4 4 0 00-4 4v1H5a3 3 0 000 6h1v1a4 4 0 008 0v-1h1a3 3 0 000-6h-1V6a4 4 0 00-4-4z" />
            </svg>
            Kepengasuhan
          </button>
          <button
            onClick={() => {
              setActiveTab("manajer");
            }}
            className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${
              activeTab === "manajer"
                ? "text-blue-800 border-b-2 border-blue-800"
                : "text-gray-500 hover:text-blue-700"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Manajer
          </button>
        </div>

        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-blue-800 font-medium">
              <span>
                Bulan: {getMonthName(selectedYear, selectedMonth)} {selectedYear}
              </span>
              <input
                type="month"
                value={`${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`}
                onChange={(e) => {
                  const value = e.target.value;
                  const [yearStr, monthStr] = value.split("-");
                  const year = parseInt(yearStr, 10);
                  const month = parseInt(monthStr, 10) - 1;
                  if (!isNaN(year) && !isNaN(month)) {
                    setSelectedYear(year);
                    setSelectedMonth(month);
                  }
                }}
                className="border border-blue-300 rounded-lg px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <table className="w-full border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-800 text-white">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold rounded-tl-lg text-xs sm:text-sm">
                    No
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm">
                    Nama
                  </th>
                  {Array.from({ length: daysInMonth }, (_, index) => {
                    const day = index + 1;
                    return (
                      <th
                        key={day}
                        className="px-1 py-2 text-center font-semibold text-[10px] sm:text-xs"
                      >
                        {day}
                      </th>
                    );
                  })}
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-xs sm:text-sm">
                    Rekap Terlambat (menit)
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-xs sm:text-sm">
                    Total Kehadiran
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={daysInMonth + 4}
                      className="py-10 text-center text-blue-800 bg-blue-50/70"
                    >
                      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-blue-100">
                        <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        <span className="text-sm sm:text-base font-medium">
                          Memuat riwayat absensi...
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && uniqueNames.map((name, rowIndex) => (
                  <tr
                    key={name}
                    className="border-b border-blue-100 hover:bg-blue-50/50 transition-colors duration-150"
                  >
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                      {rowIndex + 1}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-blue-800 text-xs sm:text-sm whitespace-nowrap">
                      {name}
                    </td>
                    {Array.from({ length: daysInMonth }, (_, index) => {
                      const day = index + 1;
                      const key = `${name}-${day}`;
                      const record = attendanceMap.get(key);
                      const leave = getApprovedLeaveForCell(name, day);
                      const status = getCellStatus(record, day, !!leave);
                      const className = getStatusClassName(status);
                      const times = getTimesForCell(name, day);

                      let titleText = "";
                      if (status === "none") {
                        titleText = "";
                      } else if (leave) {
                        const slot = leave.slot_label ? ` (${leave.slot_label})` : "";
                        titleText = `Izin: ${leave.reason}${slot}`;
                      } else if (times.length > 0) {
                        titleText = `Jam absen:\n${times.join("\n")}`;
                      } else if (status === "absent") {
                        titleText = "Belum absen pada hari ini";
                      }

                      return (
                        <td
                          key={day}
                          className="px-1 py-1 text-center align-middle"
                        >
                          {status === "none" ? (
                            <span className="inline-block h-6 w-6 sm:h-7 sm:w-7" />
                          ) : (
                            <span
                              title={titleText || undefined}
                              className={`mx-auto flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold ${className}`}
                            >
                              ✓
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right font-semibold text-blue-800 whitespace-nowrap">
                      {getTotalLateMinutesForName(name)}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right font-semibold text-blue-800 whitespace-nowrap">
                      {getTotalAttendanceForName(name)}
                    </td>
                  </tr>
                ))}
                {!isLoading && uniqueNames.length === 0 && (
                  <tr>
                    <td
                      colSpan={4 + daysInMonth}
                      className="text-center py-6 sm:py-8 text-blue-800 bg-blue-50/70 italic rounded-lg"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 sm:h-12 sm:w-12 text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm sm:text-base">
                          Belum ada riwayat absensi pada bulan ini
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="mt-4 flex flex-wrap gap-3 text-xs sm:text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full bg-blue-500" />
                <span>Tepat waktu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full bg-yellow-400" />
                <span>Lebih dari 10 menit terlambat</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full bg-red-500" />
                <span>Tidak hadir tanpa keterangan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full bg-orange-500" />
                <span>Izin atau sakit</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden space-y-3">
          <div className="mb-2 flex flex-col gap-2 text-xs text-blue-800 font-medium">
            <span>
              Bulan: {getMonthName(selectedYear, selectedMonth)} {selectedYear}
            </span>
            <input
              type="month"
              value={`${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`}
              onChange={(e) => {
                const value = e.target.value;
                const [yearStr, monthStr] = value.split("-");
                const year = parseInt(yearStr, 10);
                const month = parseInt(monthStr, 10) - 1;
                if (!isNaN(year) && !isNaN(month)) {
                  setSelectedYear(year);
                  setSelectedMonth(month);
                }
              }}
              className="border border-blue-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isLoading && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm flex items-center justify-center">
              <div className="inline-flex items-center gap-3">
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span className="text-xs font-medium text-blue-800">
                  Memuat riwayat absensi...
                </span>
              </div>
            </div>
          )}

          {!isLoading && uniqueNames.map((name, rowIndex) => (
            <div
              key={name}
              className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 shadow-sm flex flex-col gap-2"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="text-sm font-semibold text-blue-900">
                    {rowIndex + 1}. {name}
                  </div>
                  <div className="mt-1 text-[11px] text-blue-700">
                    Total kehadiran: {getTotalAttendanceForName(name)}
                  </div>
                  <div className="text-[11px] text-blue-700">
                    Rekap terlambat: {getTotalLateMinutesForName(name)} menit
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  const key = `${name}-${day}`;
                  const record = attendanceMap.get(key);
                  const leave = getApprovedLeaveForCell(name, day);
                  const status = getCellStatus(record, day, !!leave);
                  const className = getStatusClassName(status);
                  const times = getTimesForCell(name, day);

                  let titleText = "";
                  if (status === "none") {
                    titleText = "";
                  } else if (leave) {
                    const slot = leave.slot_label ? ` (${leave.slot_label})` : "";
                    titleText = `Izin: ${leave.reason}${slot}`;
                  } else if (times.length > 0) {
                    titleText = `Jam absen:\n${times.join("\n")}`;
                  } else if (status === "absent") {
                    titleText = "Belum absen pada hari ini";
                  }

                  if (status === "none") {
                    return null;
                  }

                  return (
                    <div
                      key={day}
                      className="flex flex-col items-center justify-center mr-1 mb-1 cursor-pointer"
                      onClick={() => {
                        if (titleText) {
                          setSelectedDetail({
                            title: `Detail Absensi - Tanggal ${day}`,
                            content: titleText,
                          });
                        }
                      }}
                    >
                      <span
                        title={titleText || undefined}
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${className}`}
                      >
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {!isLoading && uniqueNames.length === 0 && (
            <div className="text-center py-4 text-blue-800 bg-blue-50/70 italic rounded-lg text-sm">
              Belum ada riwayat absensi pada bulan ini
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-blue-800">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <span>Tepat waktu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span>Lebih dari 10 menit terlambat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span>Tidak hadir tanpa keterangan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-orange-500" />
              <span>Izin atau sakit</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="w-full max-w-sm sm:max-w-2xl mx-3 sm:mx-0 transform transition-all duration-300 ease-in-out">
          <DialogHeader className="border-b border-blue-100 pb-4">
            <DialogTitle className="flex items-center text-blue-800 text-xl gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">Jadwal Absensi</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 bg-blue-50/80 backdrop-blur-sm rounded-xl p-4 shadow-inner max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="sm:hidden space-y-2">
              {(scheduleByTab[activeTab] || scheduleByTab["guru"]).map(
                (schedule) => (
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
                )
              )}
            </div>
            <div className="hidden sm:block">
              <Table>
                <TableHeader className="sticky top-0 bg-blue-50/95 backdrop-blur-sm z-10 shadow-sm">
                  <TableRow className="hover:bg-blue-100/50">
                    <TableHead className="text-blue-800 font-bold">
                      Hari
                    </TableHead>
                    <TableHead className="text-blue-800 font-bold">
                      Waktu
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(scheduleByTab[activeTab] || scheduleByTab["guru"]).map(
                    (schedule) => (
                      <TableRow
                        key={schedule.day}
                        className="hover:bg-blue-100/50 transition-all duration-200 ease-in-out"
                      >
                        <TableCell className="font-medium text-blue-700 whitespace-nowrap">
                          {schedule.day}
                        </TableCell>
                        <TableCell>
                          {schedule.times.map((time, index) => (
                            <div
                              key={index}
                              className="text-sm text-blue-600 py-1 flex items-center gap-2 hover:bg-blue-100/50 rounded-lg px-2 transition-all duration-200 ease-in-out group"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors duration-200"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="group-hover:text-blue-700 transition-colors duration-200">
                                {time}
                              </span>
                            </div>
                          ))}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedDetail}
        onOpenChange={(open) => !open && setSelectedDetail(null)}
      >
        <DialogContent className="w-[90%] max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-blue-800">
              {selectedDetail?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 whitespace-pre-wrap text-sm text-gray-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            {selectedDetail?.content}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => setSelectedDetail(null)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
