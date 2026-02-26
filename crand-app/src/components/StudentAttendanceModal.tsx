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
import { Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAttendance } from "@/app/teacher/attendance/actions";
import { toast } from "sonner";
import { getRoleCurrentShift, isValidAttendanceTime } from "@/lib/shift-utils";

interface StudentAttendanceModalProps {
  studentId: string;
  studentName: string;
  onSuccess?: () => void;
  role?: "teacher" | "educator";
}

export default function StudentAttendanceModal({
  studentId,
  studentName,
  onSuccess,
  role = "teacher",
}: StudentAttendanceModalProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<
    "Present" | "Sick" | "Permission" | "Absent"
  >("Present");

  const BUFFER_MINUTES = 10;

  const handleSubmit = async () => {
    try {
      const { isValid, message, isLate, lateMinutes } = isValidAttendanceTime(new Date(), role, BUFFER_MINUTES);
      if (!isValid) {
        toast.error(message);
        return;
      }

      await createAttendance({
        student_id: studentId,
        date: new Date(),
        status: status,
        role,
        is_late: Boolean(isLate),
        late_minutes: lateMinutes || 0,
      });

      toast.success(`Kehadiran ${studentName} berhasil dicatat`);
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Gagal mencatat kehadiran");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          disabled={!isValidAttendanceTime(new Date(), role, BUFFER_MINUTES).isValid}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Absen
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-sm sm:max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Catat Kehadiran {studentName}
          </DialogTitle>
          <div className="text-xs sm:text-sm text-blue-600 mt-1 sm:mt-2">
            Shift: {getRoleCurrentShift(role, new Date())}
          </div>
          {isValidAttendanceTime(new Date(), role, BUFFER_MINUTES).isLate && (
            <div className="text-[11px] sm:text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md inline-block px-2 py-1 mt-2">
              Terlambat {isValidAttendanceTime(new Date(), role, BUFFER_MINUTES).lateMinutes} menit
            </div>
          )}
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium">Status Kehadiran</label>
            <Select
              value={status}
              onValueChange={(
                value: "Present" | "Sick" | "Permission" | "Absent"
              ) => setStatus(value)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent className="bg-white text-sm">
                <SelectItem value="Present" className="hover:bg-gray-100">
                  Hadir
                </SelectItem>
                <SelectItem value="Sick" className="hover:bg-gray-100">
                  Sakit
                </SelectItem>
                <SelectItem value="Permission" className="hover:bg-gray-100">
                  Izin
                </SelectItem>
                <SelectItem value="Absent" className="hover:bg-gray-100">
                  Alfa
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 text-xs sm:text-sm px-3"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm px-4"
              disabled={!isValidAttendanceTime(new Date(), role, BUFFER_MINUTES).isValid}
            >
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
