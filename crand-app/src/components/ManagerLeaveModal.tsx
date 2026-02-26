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
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createManagerLeaveRequest } from "@/app/manager/attendance/action";

export default function ManagerLeaveModal() {
  const [open, setOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState<string>("");
  const [leaveReason, setLeaveReason] = useState<string>("");
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [leaveType, setLeaveType] = useState<string>("");

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
        // Optional: Trigger refresh of parent component
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
          <PlusCircle className="mr-2 h-4 w-4" />
          Buat Izin Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center text-blue-800 text-xl">
            <PlusCircle className="h-6 w-6 mr-2" />
            Ajuan Izin Baru
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-6">
          <div className="pt-2">
            <p className="text-xs text-blue-700 mb-4">
              Perizinan hanya bisa diajukan maksimal <span className="font-semibold">2 jam sebelum</span> jadwal. Ajuan akan dikirim ke admin.
            </p>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
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
                <label className="text-sm font-medium text-gray-700">
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
                <label className="text-sm font-medium text-gray-700">
                  Alasan perizinan
                </label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Contoh: sakit, urusan keluarga mendesak, dll."
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSubmitLeave}
                  className="bg-blue-700 text-white hover:bg-blue-800 w-full sm:w-auto"
                  disabled={isSubmittingLeave}
                >
                  {isSubmittingLeave ? "Mengirim..." : "Kirim Ajuan"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
