"use client";

import { Button } from "@/components/ui/button";
import { createAttendance } from "@/app/teacher/attendance/action";
import { useToast } from "@/components/ui/use-toast";
import { isValidAttendanceTime } from "@/lib/shift-utils";

interface TeacherAttendanceButtonProps {
  studentId: string;
  status: "Hadir" | "Izin" | "Sakit" | "Alfa";
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function TeacherAttendanceButton({
  studentId,
  status,
  onSuccess,
  onError,
}: TeacherAttendanceButtonProps) {
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      const { isValid, message } = isValidAttendanceTime(new Date());
      if (!isValid) {
        toast({
          variant: "destructive",
          title: "Di luar jadwal",
          description: message,
        });
        onError(message);
        return;
      }
      const statusMap = {
        "Hadir": "Present",
        "Alfa": "Absent",
        "Sakit": "Sick",
        "Izin": "Permission"
      } as const;

      const result = await createAttendance({
        student_id: studentId,
        date: new Date(),
        status: statusMap[status],
      });

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Absensi berhasil dicatat",
        });
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Gagal",
          description: "Terjadi kesalahan saat mencatat absensi",
        });
        onError("Terjadi kesalahan saat mencatat absensi");
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat mencatat absensi",
      });
      onError("Terjadi kesalahan saat mencatat absensi");
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "Hadir":
        return "bg-blue-600 hover:bg-blue-700";
      case "Izin":
        return "bg-yellow-600 hover:bg-yellow-700";
      case "Sakit":
        return "bg-blue-600 hover:bg-blue-700";
      case "Alfa":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <Button
      onClick={handleSubmit}
      className={`w-full ${getStatusColor()}`}
      disabled={!isValidAttendanceTime(new Date()).isValid}
    >
      Simpan Absensi
    </Button>
  );
}