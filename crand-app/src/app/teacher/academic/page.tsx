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
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { getAcademicData, AcademicData } from "./action";
import { useRouter } from "next/navigation";

const AcademicPage = () => {
  const router = useRouter();
  const [academicData, setAcademicData] = useState<AcademicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAcademicData();
        setAcademicData(data);
      } catch (error) {
        console.error("Error fetching academic data:", error);
        setError("Gagal memuat data akademik");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDetailClick = (studentId: string) => {
    router.push(`/teacher/academic/grades/${studentId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 m-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Akademik</h1>
          <p className="text-gray-600">
            Kelola nilai akademik santri di kelas Anda
          </p>
        </div>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Daftar Nilai Santri</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>NISN</TableHead>
                <TableHead>Detail Nilai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicData.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.student_name}</TableCell>
                  <TableCell>{student.class_name}</TableCell>
                  <TableCell>{student.nisn}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-50"
                      onClick={() => handleDetailClick(student.student_id)}
                    >
                      Detail
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
