"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import AttendanceModal from "@/components/AttendanceModal";
import { useState } from "react";

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([
    {
      name: "Ahmad Farhan",
      class: "10A",
      status: "Hadir",
      date: "2024-03-20",
    },
    {
      name: "Fatimah Azzahra",
      class: "10A",
      status: "Izin",
      date: "2024-03-20",
    },
    {
      name: "Muhammad Rizky",
      class: "10A",
      status: "Hadir",
      date: "2024-03-20",
    },
  ]);

  const handleAttendanceSuccess = (name: string, timestamp: string) => {
    setAttendanceData((prevData) => [
      {
        name,
        class: "10A",
        status: "Hadir",
        date: new Date().toISOString().split("T")[0],
      },
      ...prevData,
    ]);
  };

  const handleAttendanceError = (message: string) => {
    console.error(message);
  };

  return (
    <div className="space-y-6 m-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Kehadiran</h1>
          <p className="text-gray-600">Kelola kehadiran santri di kelas Anda</p>
        </div>
        <AttendanceModal
          onSuccess={handleAttendanceSuccess}
          onError={handleAttendanceError}
        />
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Daftar Kehadiran Santri</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData.map((student, index) => (
                <TableRow key={index}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        student.status === "Hadir"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {student.status}
                    </span>
                  </TableCell>
                  <TableCell>{student.date}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-50"
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;
