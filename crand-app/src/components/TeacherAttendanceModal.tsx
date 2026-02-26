"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import AttendanceButton from "./AttendanceButton";
import { createTeacherLeaveRequest } from "@/app/teacher/attendance/actions";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SHIFT_SCHEDULES, SHIFT_TIMES, getSchedulesByRole, getTimeLabelsByRole, Role } from "@/lib/shift-utils";

export default function TeacherAttendanceModal({ role = 'teacher' }: { role?: Role }) {
  const [open, setOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState<string>("");
  const [leaveReason, setLeaveReason] = useState<string>("");
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [leaveSlotKey, setLeaveSlotKey] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAttendanceSuccess = (name: string, timestamp: string) => {
    console.log(`Absensi berhasil untuk ${name} pada ${timestamp}`);
  };

  const handleAttendanceError = (message: string) => {
    console.error(message);
  };

  const validateLeaveRequest = (dateStr: string, slotKey: string): { isValid: boolean; message?: string } => {
    if (!dateStr) return { isValid: true };
    
    const now = new Date();
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // 1. Cek tanggal lewat
    if (selectedDate < today) {
      return { isValid: false, message: "Tidak dapat mengajukan izin untuk tanggal yang sudah lewat." };
    }

    // 2. Cek waktu 2 jam sebelum jadwal
    if (selectedDate.getTime() === today.getTime() && slotKey) {
      let startTime = 0;
      
      if (slotKey === 'full_day') {
        // Ambil jadwal pertama hari ini
        const dayOfWeek = selectedDate.getDay();
        const schedules = getSchedulesByRole(role)[dayOfWeek] || [];
        if (schedules.length > 0) {
          startTime = schedules[0].start;
        } else {
           return { isValid: true }; // Tidak ada jadwal, mungkin tidak perlu validasi jam
        }
      } else {
        const [start] = slotKey.split('-').map(Number);
        startTime = start;
      }

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const limitMinutes = startTime - 120; // 2 jam sebelum

      if (currentMinutes > limitMinutes) {
         // Hitung sisa waktu atau berapa terlambat
         return { isValid: false, message: "Pengajuan izin minimal 2 jam sebelum jadwal dimulai." };
      }
    }

    return { isValid: true };
  };

  const handleSubmitLeave = async () => {
    if (!leaveDate) {
      toast.error("Silakan pilih tanggal perizinan.");
      return;
    }
    
    const validation = validateLeaveRequest(leaveDate, leaveSlotKey);
    if (!validation.isValid) {
      toast.error(validation.message);
      setValidationError(validation.message || null);
      return;
    }

    if (!leaveReason.trim()) {
      toast.error("Silakan isi alasan perizinan.");
      return;
    }
    if (!leaveSlotKey) {
      toast.error("Silakan pilih waktu mengajar yang diajukan izin.");
      return;
    }

    try {
      setIsSubmittingLeave(true);
      const date = new Date(leaveDate);
      await createTeacherLeaveRequest({
        date,
        reason: leaveReason.trim(),
        slotKey: leaveSlotKey,
        role: role,
      });
      toast.success("Ajuan perizinan berhasil dikirim ke admin.");
      setLeaveReason("");
      setLeaveDate("");
      setLeaveSlotKey("");
      setValidationError(null);
    } catch (error: any) {
      const message =
        error?.message ||
        "Gagal mengirim ajuan perizinan. Silakan coba lagi.";
      toast.error(message);
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  const availableSlots = (() => {
    if (!leaveDate) return [];
    const date = new Date(leaveDate + "T00:00:00");
    const dayOfWeek = date.getDay();
    const schedules = getSchedulesByRole(role)[dayOfWeek] || [];
    const labels = getTimeLabelsByRole(role);
    
    return schedules.map((s) => {
      const key = `${s.start}-${s.end}`;
      const label = labels[key] || key;
      return { key, label };
    });
  })();

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
        }}
      >
        <DialogTrigger asChild>
          <Button className="bg-[#48A6A7] hover:bg-[#3d9395]">
            <Calendar className="mr-2 h-4 w-4" />
            Absensi SDM
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center text-blue-800 text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Absensi SDM
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Absensi Masuk</h3>
              <p className="text-sm text-blue-600 mb-4">
                Pastikan wajah terlihat jelas di kamera untuk melakukan absensi.
              </p>
              <AttendanceButton
                onSuccess={handleAttendanceSuccess}
                onError={handleAttendanceError}
                isModalOpen={open}
              />
            </div>

            <div className="border-t border-blue-100 pt-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                Ajuan Perizinan Tidak Masuk
              </h3>
              <p className="text-xs text-blue-700 mb-3">
                Perizinan hanya bisa diajukan maksimal <span className="font-semibold">2 jam sebelum</span> jadwal yang dipilih. Ajuan akan dikirim ke admin.
              </p>
              <div className="space-y-3">
                {validationError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs font-medium">
                    {validationError}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Tanggal tidak masuk
                  </label>
                  <input
                    type="date"
                    value={leaveDate}
                    onChange={(e) => {
                      setLeaveDate(e.target.value);
                      const validation = validateLeaveRequest(e.target.value, leaveSlotKey);
                      setValidationError(validation.message || null);
                    }}
                    className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Waktu mengajar yang diajukan izin
                  </label>
                  <Select
                    value={leaveSlotKey}
                    onValueChange={(val) => {
                      setLeaveSlotKey(val);
                      const validation = validateLeaveRequest(leaveDate, val);
                      setValidationError(validation.message || null);
                    }}
                    disabled={!leaveDate || availableSlots.length === 0}
                  >
                    <SelectTrigger className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <SelectValue placeholder={leaveDate ? "Pilih waktu mengajar" : "Pilih tanggal terlebih dahulu"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="full_day">
                        Sehari penuh
                      </SelectItem>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot.key} value={slot.key}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {leaveDate && availableSlots.length === 0 && (
                    <p className="mt-1 text-[11px] text-red-600">
                      Tidak ada jadwal mengajar pada hari yang dipilih.
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Alasan perizinan
                  </label>
                  <textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Contoh: sakit, urusan keluarga mendesak, dll."
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitLeave}
                    className="bg-blue-700 text-white hover:bg-blue-800"
                    disabled={isSubmittingLeave}
                  >
                    {isSubmittingLeave ? "Mengirim..." : "Kirim Ajuan Perizinan"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
