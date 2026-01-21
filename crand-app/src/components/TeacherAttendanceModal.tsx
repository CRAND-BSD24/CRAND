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
  };

  const handleAttendanceError = (message: string) => {
    console.error(message);
  };

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
            Absensi Ustadz
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center text-emerald-800 text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Absensi Ustadz
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-emerald-800 mb-2">Aktifkan Kamera</h3>
              <p className="text-sm text-emerald-600 mb-4">Pastikan wajah terlihat jelas di kamera untuk melakukan absensi</p>
              <AttendanceButton
                onSuccess={handleAttendanceSuccess}
                onError={handleAttendanceError}
                isModalOpen={open}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
