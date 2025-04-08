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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAttendance } from "@/app/teacher/attendance/action";
import { toast } from "sonner";

interface AttendanceModalProps {
  studentId: string;
  studentName: string;
  onSuccess?: () => void;
}

export default function AttendanceModal({
  studentId,
  studentName,
  onSuccess,
}: AttendanceModalProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<
    "Present" | "Sick" | "Permission" | "Absent"
  >("Present");

  const handleSubmit = async () => {
    try {
      await createAttendance({
        student_id: studentId,
        date: new Date(),
        status: status,
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
        <Button variant="outline">Edit Kehadiran</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Kehadiran {studentName}</DialogTitle>
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
              <SelectContent>
                <SelectItem value="Present">Hadir</SelectItem>
                <SelectItem value="Sick">Sakit</SelectItem>
                <SelectItem value="Permission">Izin</SelectItem>
                <SelectItem value="Absent">Tidak Hadir</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>Simpan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
