"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getDepartmentStaffAttendanceMonthly, getManagerProfile } from "./action";
import { Loader2, Search, Check, X, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const ManagerAttendanceModal = dynamic(() => import("@/components/ManagerAttendanceModal"), { ssr: false });

const scheduleInfo = [
  { day: "Senin", times: ["08:00 - 16:30"] },
  { day: "Selasa", times: ["08:00 - 16:30"] },
  { day: "Rabu", times: ["08:00 - 16:30"] },
  { day: "Kamis", times: ["08:00 - 16:30"] },
  { day: "Jumat", times: ["08:00 - 16:30"] },
  { day: "Sabtu", times: ["08:00 - 16:30"] },
  { day: "Minggu", times: ["Libur"] },
];

export default function ManagerAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [department, setDepartment] = useState<string | null>(null);
  
  // History Calendar State
  const [staffData, setStaffData] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filterName, setFilterName] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = useCallback(async () => {
      setLoadingHistory(true);
      try {
          const res = await getDepartmentStaffAttendanceMonthly(selectedMonth, selectedYear);
          setStaffData(res.staff);
          setAttendanceRecords(res.records);
          setLeaveRecords(res.leaves);
      } catch (error) {
          console.error("Error fetching history:", error);
      } finally {
          setLoadingHistory(false);
      }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const fetchProfile = async () => {
        try {
            const profile = await getManagerProfile();
            if (profile && profile.department) {
                setDepartment(profile.department);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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

  // Calendar Logic
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  
  const filteredStaff = useMemo(() => {
      if (!filterName) return staffData;
      return staffData.filter(s => s.name.toLowerCase().includes(filterName.toLowerCase()));
  }, [staffData, filterName]);

  const [selectedDetail, setSelectedDetail] = useState<{
    title: string;
    content: string;
  } | null>(null);

  // Helper to get status for a specific cell
  const getCellData = (staffId: string, day: number) => {
      const currentDate = new Date(selectedYear, selectedMonth, day);
      
      // Check for Leave
      const leave = leaveRecords.find(l => {
          const start = new Date(l.start_date);
          const end = new Date(l.end_date);
          start.setHours(0,0,0,0);
          end.setHours(0,0,0,0);
          const current = new Date(currentDate);
          current.setHours(0,0,0,0);
          
          return l.staff_id === staffId && current >= start && current <= end;
      });

      if (leave) {
          return {
              status: 'excused',
              tooltip: `Izin: ${leave.reason} (${leave.type})`,
              time: leave.type,
              className: "bg-orange-500 text-white"
          };
      }

      // Find record
      const record = attendanceRecords.find(r => {
          const d = new Date(r.created_at);
          return r.staff_id === staffId && d.getDate() === day;
      });

      if (!record) {
          // Check if it's a future date
          const today = new Date();
          const checkDate = new Date(selectedYear, selectedMonth, day);
          
          // Reset hours for comparison
          today.setHours(0,0,0,0);
          
          if (checkDate > today) return { status: 'none', className: "bg-gray-100 text-gray-400" };
          
          // Check if weekend (Sunday)
          if (checkDate.getDay() === 0) return { status: 'holiday', className: "bg-red-100 text-gray-500", tooltip: "Libur" };

          return { status: 'absent', className: "bg-red-500 text-white", tooltip: "Tidak Hadir" };
      }

      if (record.is_late) {
          return {
              status: 'late',
              time: record.timestamp,
              late_minutes: record.late_minutes,
              className: "bg-yellow-400 text-white",
              tooltip: `Terlambat ${record.late_minutes} menit\nJam: ${record.timestamp}`
          };
      }

      return {
          status: 'present',
          time: record.timestamp,
          className: "bg-blue-500 text-white",
          tooltip: `Hadir: ${record.timestamp}`
      };
  };

  const calculateTotalLate = (staffId: string) => {
      return attendanceRecords
          .filter(r => r.staff_id === staffId && r.is_late)
          .reduce((acc, curr) => acc + (curr.late_minutes || 0), 0);
  };

  const calculateTotalAttendance = (staffId: string) => {
      return attendanceRecords.filter(r => r.staff_id === staffId).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e2f6f4] flex items-center justify-center px-4 lg:pl-64 pt-16">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-800 animate-spin mb-4" />
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
                  <p className="text-blue-600 text-sm">Kelola absensi harian dan pantau staff departemen {department}</p>
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
                <ManagerAttendanceModal />
              </div>
            </div>
            <div className="w-full flex justify-center">
              <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-sm border border-blue-100">
                <Clock className="h-4 w-4" />
                <span>{currentTime ? formatDateTime(currentTime) : "Memuat waktu..."}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-bold text-blue-800 flex items-center">
                <div className="w-1 h-5 bg-blue-600 rounded-full mr-2"></div>
                Riwayat Absensi Staff
              </h3>
              
              <div className="flex flex-wrap items-center gap-2">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari staff..."
                      className="pl-9 w-[200px]"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                 </div>
                 <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                 </Select>
                 <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => (
                        <SelectItem key={i} value={(new Date().getFullYear() - 2 + i).toString()}>
                          {new Date().getFullYear() - 2 + i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                 </Select>
              </div>
            </div>
            
            {loadingHistory ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <TooltipProvider>
                    <table className="w-full border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-blue-800 text-white">
                          <th className="px-4 py-3 text-left font-semibold rounded-tl-lg text-sm w-10">No</th>
                          <th className="px-4 py-3 text-left font-semibold text-sm w-48 sticky left-0 bg-blue-800 z-10">Nama</th>
                          {Array.from({ length: daysInMonth }, (_, index) => (
                            <th key={index} className="px-1 py-2 text-center font-semibold text-xs w-8">
                              {index + 1}
                            </th>
                          ))}
                          <th className="px-2 py-3 text-center font-semibold rounded-tr-lg text-sm w-16">Rekap Terlambat (menit)</th>
                          <th className="px-2 py-3 text-center font-semibold text-sm w-16">Total Kehadiran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredStaff.length === 0 ? (
                          <tr>
                              <td colSpan={daysInMonth + 4} className="text-center py-8 text-gray-500">
                                  Tidak ada data staff ditemukan
                              </td>
                          </tr>
                        ) : (
                          filteredStaff.map((staff, index) => {
                            return (
                            <tr key={staff._id} className="hover:bg-blue-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-800 sticky left-0 bg-white z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                  {staff.name}
                              </td>
                              {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                                const cellData = getCellData(staff._id, dayIndex + 1);
                                return (
                                  <td key={dayIndex} className="px-1 py-2 text-center">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div 
                                          className={cn(
                                            "w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold cursor-help transition-all hover:scale-110",
                                            cellData.className
                                          )}
                                        >
                                          {cellData.status === 'present' && <Check className="w-3 h-3" />}
                                          {cellData.status === 'late' && <span className="text-[9px]">L</span>}
                                          {cellData.status === 'excused' && <span className="text-[8px] uppercase">{cellData.time?.substring(0,1)}</span>}
                                          {cellData.status === 'absent' && <X className="w-3 h-3" />}
                                          {cellData.status === 'holiday' && <span className="text-gray-400">-</span>}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="whitespace-pre-wrap text-center">{cellData.tooltip}</div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </td>
                                );
                              })}
                              <td className="px-4 py-3 text-center text-sm font-medium text-blue-800">
                                  {calculateTotalLate(staff._id)}
                              </td>
                              <td className="px-4 py-3 text-center text-sm font-medium text-blue-800">
                                  {calculateTotalAttendance(staff._id)}
                              </td>
                            </tr>
                          )})
                        )}
                      </tbody>
                    </table>
                  </TooltipProvider>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-3 p-4">
                  {filteredStaff.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      Tidak ada data staff ditemukan
                    </div>
                  ) : (
                    filteredStaff.map((staff, index) => (
                      <div key={staff._id} className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="text-sm font-semibold text-blue-900">
                              {index + 1}. {staff.name}
                            </div>
                            <div className="mt-1 text-[11px] text-blue-700">
                              Total kehadiran: {calculateTotalAttendance(staff._id)}
                            </div>
                            <div className="text-[11px] text-blue-700">
                              Rekap terlambat: {calculateTotalLate(staff._id)} menit
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                             const day = dayIndex + 1;
                             const cellData = getCellData(staff._id, day);
                             if (cellData.status === 'none') return null;

                             return (
                               <div
                                 key={day}
                                 className="flex flex-col items-center justify-center mr-1 mb-1 cursor-pointer"
                                 onClick={() => {
                                   if (cellData.tooltip) {
                                     setSelectedDetail({
                                       title: `Detail Absensi - Tanggal ${day}`,
                                       content: cellData.tooltip,
                                     });
                                   }
                                 }}
                               >
                                 <span
                                   className={cn(
                                     "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                                     cellData.className
                                   )}
                                 >
                                   {day}
                                 </span>
                               </div>
                             );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
            
            <div className="p-4 border-t bg-gray-50 flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
                    <span>Hadir Tepat Waktu</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-400 text-white flex items-center justify-center text-[10px] font-bold">L</div>
                    <span>Terlambat (&gt;10 menit)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">I</div>
                    <span>Izin/Sakit/Cuti</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"><X className="w-3 h-3 text-white" /></div>
                    <span>Tidak Hadir (Alfa)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-100 text-gray-500 flex items-center justify-center font-bold">-</div>
                    <span>Hari Libur</span>
                </div>
            </div>

          </div>
        </div>
      </div>

      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-blue-800">Jadwal Kerja Manager</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {scheduleInfo.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                  <span className="font-medium text-gray-700">{item.day}</span>
                  <div className="flex flex-col items-end gap-1">
                    {item.times.map((time, idx) => (
                      <span key={idx} className={`text-sm ${time === 'Libur' ? 'text-red-500 font-medium' : 'text-blue-600'}`}>
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
              <p className="font-semibold mb-1">Catatan:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Absensi dapat dilakukan mulai 60 menit sebelum jam masuk.</li>
                <li>Keterlambatan dihitung dari jam masuk yang ditentukan.</li>
              </ul>
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
    </main>
  );
}
