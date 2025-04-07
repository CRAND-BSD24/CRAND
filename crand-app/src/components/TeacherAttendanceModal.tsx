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

export default function TeacherAttendanceModal() {
  const [open, setOpen] = useState(false);

  const handleAttendanceSuccess = (name: string, timestamp: string) => {
    console.log(`Absensi berhasil untuk ${name} pada ${timestamp}`);
    setOpen(false);
  };

  const handleAttendanceError = (message: string) => {
    console.error(message);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#48A6A7] hover:bg-[#3d9395]">
          <Calendar className="mr-2 h-4 w-4" />
          Absensi Ustadz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Absensi Ustadz</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AttendanceButton
            onSuccess={handleAttendanceSuccess}
            onError={handleAttendanceError}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
