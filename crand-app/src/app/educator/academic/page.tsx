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
import { getAcademicDataForEducator, AcademicData } from "@/app/educator/academic/action";
import { useRouter } from "next/navigation";

const AcademicPage = () => {
  const router = useRouter();
  const [academicData, setAcademicData] = useState<AcademicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAcademicDataForEducator();
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
    router.push(`/educator/academic/grades/${studentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e2f6f4] flex items-center justify-center px-4 lg:pl-64 pt-16">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-800 rounded-full animate-spin mb-4"></div>
          <div className="text-emerald-800 text-base font-medium">Loading data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#e2f6f4] flex items-center justify-center px-4 lg:pl-64 pt-16 text-red-500 font-medium">
        {error}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#e2f6f4] pt-16">
      <div className="lg:pl-1">
        <div className="pl-4 pr-4 sm:pl-6 lg:pl-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-700 text-white rounded-lg mr-3">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-emerald-800">Manajemen Akademik</h1>
                <p className="text-emerald-600 text-sm">
                  Kelola nilai akademik santri di kelas Anda
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-emerald-800 flex items-center">
                <div className="w-1 h-5 bg-emerald-600 rounded-full mr-2"></div>
                Daftar Nilai Santri
              </h3>
            </div>
            <div className="p-4">
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
                          className="hover:bg-emerald-50 text-emerald-600 border-emerald-200"
                          onClick={() => handleDetailClick(student.student_id)}
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AcademicPage;