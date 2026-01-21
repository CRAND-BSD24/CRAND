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
          className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          disabled={!isValidAttendanceTime(new Date(), role, BUFFER_MINUTES).isValid}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Absen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Kehadiran {studentName}</DialogTitle>
          <div className="text-sm text-emerald-600 mt-2">
            Shift: {getRoleCurrentShift(role, new Date())}
          </div>
          {isValidAttendanceTime(new Date(), role, BUFFER_MINUTES).isLate && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md inline-block px-2 py-1 mt-2">
              Terlambat {isValidAttendanceTime(new Date(), role, BUFFER_MINUTES).lateMinutes} menit
            </div>
          )}
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status Kehadiran</label>
            <Select
              value={status}
              onValueChange={(
                value: "Present" | "Sick" | "Permission" | "Absent"
              ) => setStatus(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
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
              className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
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
