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
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createManagerLeaveRequest } from "@/app/manager/attendance/action";

export default function ManagerAttendanceModal() {
  const [open, setOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState<string>("");
  const [leaveReason, setLeaveReason] = useState<string>("");
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [leaveType, setLeaveType] = useState<string>("");

  const handleAttendanceSuccess = (name: string, timestamp: string) => {
    toast.success(`Absensi berhasil untuk ${name} pada ${timestamp}`);
    setOpen(false);
  };

  const handleAttendanceError = (message: string) => {
    toast.error(message);
  };

  const handleSubmitLeave = async () => {
    if (!leaveDate) {
      toast.error("Silakan pilih tanggal perizinan.");
      return;
    }
    if (!leaveReason.trim()) {
      toast.error("Silakan isi alasan perizinan.");
      return;
    }
    if (!leaveType) {
      toast.error("Silakan pilih jenis izin.");
      return;
    }

    try {
      setIsSubmittingLeave(true);
      
      const result = await createManagerLeaveRequest({
        startDate: new Date(leaveDate),
        endDate: new Date(leaveDate),
        type: leaveType,
        reason: leaveReason
      });

      if (result.success) {
        toast.success(result.message || "Ajuan perizinan berhasil dikirim ke admin.");
        setLeaveReason("");
        setLeaveDate("");
        setLeaveType("");
        setOpen(false);
      } else {
        toast.error(result.message || "Gagal mengirim ajuan perizinan.");
      }
    } catch (error: any) {
      const message =
        error?.message ||
        "Gagal mengirim ajuan perizinan. Silakan coba lagi.";
      toast.error(message);
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-700 hover:bg-blue-800 text-white">
          <Calendar className="mr-2 h-4 w-4" />
          Absensi Manager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center text-blue-800 text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Absensi Manager
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Absensi Masuk</h3>
            <p className="text-sm text-blue-600 mb-4">
              Pastikan wajah terlihat jelas di kamera untuk melakukan absensi.
            </p>
            <AttendanceButton
              type="manager"
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
              Perizinan hanya bisa diajukan maksimal <span className="font-semibold">2 jam sebelum</span> jadwal. Ajuan akan dikirim ke admin.
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Tanggal tidak masuk
                </label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Jenis Izin
                </label>
                <Select
                  value={leaveType}
                  onValueChange={setLeaveType}
                >
                  <SelectTrigger className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <SelectValue placeholder="Pilih jenis izin" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Izin">Izin</SelectItem>
                    <SelectItem value="Sakit">Sakit</SelectItem>
                    <SelectItem value="Cuti">Cuti</SelectItem>
                  </SelectContent>
                </Select>
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
  );
}
