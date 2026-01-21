"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AggregatedStudentData } from "@/app/teacher/attendance/action";
import { Button } from "@/components/ui/button";
import { Pencil, History } from "lucide-react";
import StudentAttendanceModal from "./StudentAttendanceModal";
import { useEffect, useState } from "react";
import { getAttendanceStatus } from "@/app/teacher/attendance/actions";
import { getRoleCurrentShift } from "@/lib/shift-utils";

interface StudentTableProps {
  students: AggregatedStudentData[];
  onHistoryClick: (student: AggregatedStudentData) => void;
  role?: "teacher" | "educator";
}

export default function StudentTable({ students, onHistoryClick, role = "teacher" }: StudentTableProps) {
  const [attendanceStatus, setAttendanceStatus] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      try {
        const statusMap = await getAttendanceStatus(students.map((s) => s.id));
        setAttendanceStatus(statusMap);
      } catch (error) {
        console.error("Error fetching attendance status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceStatus();
  }, [students]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Sick":
        return "bg-yellow-100 text-yellow-800";
      case "Permission":
        return "bg-blue-100 text-blue-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Present":
        return "Hadir";
      case "Sick":
        return "Sakit";
      case "Permission":
        return "Izin";
      case "Absent":
        return "Alfa";
      default:
        return "Belum Absen";
    }
  };

  const handleAttendanceSuccess = async () => {
    try {
      const statusMap = await getAttendanceStatus(students.map((s) => s.id));
      setAttendanceStatus(statusMap);
    } catch (error) {
      console.error("Error refreshing attendance status:", error);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Kelas</TableHead>
          <TableHead>NISN</TableHead>
          <TableHead>Program</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Shift</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={`${student.id}-${student.nisn}`}>
            <TableCell>{student.name}</TableCell>
            <TableCell>{student.class_name}</TableCell>
            <TableCell>{student.nisn}</TableCell>
            <TableCell>{student.program}</TableCell>
            <TableCell>{formatDate(new Date())}</TableCell>
            <TableCell className="text-emerald-600 font-medium">
              {getRoleCurrentShift(role, new Date())}
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeStyle(attendanceStatus[student.id])}`}>
                {getStatusText(attendanceStatus[student.id])}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                {attendanceStatus[student.id] ? (
                  <StudentAttendanceModal
                    studentId={student.id}
                    studentName={student.name}
                    onSuccess={handleAttendanceSuccess}
                    role={role}
                  />
                ) : (
                  <StudentAttendanceModal
                    studentId={student.id}
                    studentName={student.name}
                    onSuccess={handleAttendanceSuccess}
                    role={role}
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onHistoryClick(student)}
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                >
                  <History className="h-4 w-4 mr-2" />
                  Riwayat
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
