"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getStudentsByTeacherId, AggregatedStudentData } from "./action";
import StudentTable from "@/components/StudentTable";
import TeacherAttendanceModal from "@/components/TeacherAttendanceModal";

const AttendancePage = () => {
  const [students, setStudents] = useState<AggregatedStudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudentsByTeacherId();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Gagal memuat data siswa");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

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
          <h1 className="text-2xl font-bold">Manajemen Kehadiran</h1>
          <p className="text-gray-600">Kelola kehadiran santri di kelas Anda</p>
        </div>
        <TeacherAttendanceModal />
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Daftar Kehadiran Santri</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentTable students={students} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;
