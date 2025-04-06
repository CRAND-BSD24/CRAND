"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const AttendancePage = () => {
  const attendanceData = [
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manajemen Kehadiran</h1>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Tambah Kehadiran
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kehadiran Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Siswa</TableHead>
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
                    <Button variant="outline" size="sm">
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