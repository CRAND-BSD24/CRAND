"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const AcademicPage = () => {
  const academicData = [
    {
      name: "Ahmad Farhan",
      class: "10A",
      subject: "Matematika",
      score: 85,
      grade: "A",
    },
    {
      name: "Fatimah Azzahra",
      class: "10A",
      subject: "Matematika",
      score: 92,
      grade: "A+",
    },
    {
      name: "Muhammad Rizky",
      class: "10A",
      subject: "Matematika",
      score: 78,
      grade: "B+",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manajemen Akademik</h1>
        <Button>
          <BookOpen className="mr-2 h-4 w-4" />
          Tambah Nilai
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Nilai Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicData.map((student, index) => (
                <TableRow key={index}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.subject}</TableCell>
                  <TableCell>{student.score}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        student.grade === "A+"
                          ? "bg-green-100 text-green-800"
                          : student.grade === "A"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {student.grade}
                    </span>
                  </TableCell>
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

export default AcademicPage; 