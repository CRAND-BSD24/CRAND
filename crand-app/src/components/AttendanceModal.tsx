"use client";

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

interface AttendanceModalProps {
  onSuccess?: (name: string, timestamp: string) => void;
  onError?: (message: string) => void;
}

export default function AttendanceModal({
  onSuccess,
  onError,
}: AttendanceModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Calendar className="mr-2 h-4 w-4" />
          Absensi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Absensi Ustadz</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AttendanceButton onSuccess={onSuccess} onError={onError} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
