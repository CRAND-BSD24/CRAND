"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import { Users, BookOpen, Calendar } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import {
  getStudentsByTeacherId,
  AggregatedStudentData,
} from "./attendance/action";
import { getTeacherData, TeacherData, ClassData } from "./action";
import { getDashboardData, DashboardData } from "./dashboard/action";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TeacherDashboard = () => {
  const [students, setStudents] = useState<AggregatedStudentData[]>([]);
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teacherData, studentsData, dashboardData] = await Promise.all([
          getTeacherData(),
          getStudentsByTeacherId(),
          getDashboardData(),
        ]);

        setTeacher(teacherData.teacher);
        setClassData(teacherData.classData);
        setStudents(studentsData);
        setDashboardData(dashboardData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const weeklyData = {
    labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
    datasets: [
      {
        label: "Hafalan (halaman)",
        data: dashboardData?.weeklyProgress.memorization || [0, 0, 0, 0],
        backgroundColor: "#4F46E5",
      },
      {
        label: "Belajar (nilai)",
        data: dashboardData?.weeklyProgress.academic || [0, 0, 0, 0],
        backgroundColor: "#22C55E",
      },
    ],
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0] h-full-screen m-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Selamat datang di Sistem Manajemen Pesantren.
          </p>
        </div>
        {teacher && (
          <div className="text-right">
            <p className="text-lg font-semibold">Selamat datang</p>
            <p className="text-xl font-bold">{teacher.name}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center space-x-4">
            <Users className="text-blue-500 w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">Total Santri</p>
              <p className="text-2xl font-bold">{students.length}</p>
              {classData && (
                <p className="text-sm text-gray-500">
                  Kelas {classData.class_name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4">
            <BookOpen className="text-purple-500 w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">Rata-rata Hafalan</p>
              <p className="text-2xl font-bold">
                {dashboardData?.averageMemorization.toFixed(1) || 0}
              </p>
              <p className="text-sm text-gray-500">halaman/minggu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4">
            <Calendar className="text-orange-500 w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">Kehadiran</p>
              <p className="text-2xl font-bold">
                {dashboardData?.attendanceRate.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-gray-500">hari ini</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Perkembangan Mingguan</CardTitle>
            <p className="text-sm text-gray-500">
              Rata-rata capaian hafalan dan belajar santri per minggu
            </p>
          </CardHeader>
          <CardContent>
            <Bar data={weeklyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Santri Berprestasi Minggu Ini</CardTitle>
            <p className="text-sm text-gray-500">
              Santri dengan pencapaian terbaik
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {students.slice(0, 3).map((student, index) => (
                <li key={index} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                    {student.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-gray-500">
                      {student.class_name}
                    </p>
                    <p className="text-sm text-gray-700">
                      {student.academic_level}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
