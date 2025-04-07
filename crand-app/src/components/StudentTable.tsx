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
import { Pencil } from "lucide-react";
import StudentAttendanceModal from "./StudentAttendanceModal";
import { useEffect, useState } from "react";
import { getAttendanceStatus } from "@/app/teacher/attendance/actions";

interface StudentTableProps {
  students: AggregatedStudentData[];
}

export default function StudentTable({ students }: StudentTableProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "text-green-600";
      case "Sick":
        return "text-yellow-600";
      case "Permission":
        return "text-blue-600";
      case "Absent":
        return "text-red-600";
      default:
        return "text-gray-600";
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
        return "Tidak Hadir";
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
            <TableCell className={getStatusColor(attendanceStatus[student.id])}>
              {getStatusText(attendanceStatus[student.id])}
            </TableCell>
            <TableCell>
              {attendanceStatus[student.id] ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-blue-50"
                  disabled
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <StudentAttendanceModal
                  studentId={student.id}
                  studentName={student.name}
                  onSuccess={handleAttendanceSuccess}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
