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
import { BookText } from "lucide-react";

const MemorizationPage = () => {
  const memorizationData = [
    {
      name: "Ahmad Farhan",
      class: "10A",
      surah: "Al-Fatihah",
      progress: "5/7",
      status: "Baik",
    },
    {
      name: "Fatimah Azzahra",
      class: "10A",
      surah: "Al-Baqarah",
      progress: "12/286",
      status: "Sangat Baik",
    },
    {
      name: "Muhammad Rizky",
      class: "10A",
      surah: "Al-Fatihah",
      progress: "3/7",
      status: "Cukup",
    },
  ];

  return (
    <div className="space-y-6 m-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Hafalan</h1>
          <p className="text-gray-600">
            Kelola progress hafalan santri di kelas Anda
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <BookText className="mr-2 h-4 w-4" />
          Tambah Hafalan
        </Button>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Daftar Hafalan Santri</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Surah</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memorizationData.map((student, index) => (
                <TableRow key={index}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.surah}</TableCell>
                  <TableCell>{student.progress}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        student.status === "Sangat Baik"
                          ? "bg-green-100 text-green-800"
                          : student.status === "Baik"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {student.status}
                    </span>
                  </TableCell>
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

export default MemorizationPage;
