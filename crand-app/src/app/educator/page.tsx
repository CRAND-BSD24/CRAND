"use client";

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
} from "@/app/teacher/attendance/action";
import { getTeacherData, TeacherData, ClassData } from "@/app/teacher/action";
import { getDashboardData, DashboardData } from "@/app/teacher/dashboard/action";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EducatorDashboard = () => {
  const [students, setStudents] = useState<AggregatedStudentData[]>([]);
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
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
        backgroundColor: "#047857",
        borderRadius: 4,
        maxBarThickness: 35,
      },
      {
        label: "Belajar (nilai)",
        data: dashboardData?.weeklyProgress.academic || [0, 0, 0, 0],
        backgroundColor: "#0284c7",
        borderRadius: 4,
        maxBarThickness: 35,
      },
    ],
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

  return (
    <div className="min-h-screen bg-[#e2f6f4] px-4 lg:pl-64 pt-16 space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center">
          <div className="p-2 bg-emerald-700 text-white rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01-.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-emerald-800">Dashboard Ustadz</h1>
            <p className="text-emerald-600 text-sm">
              Selamat datang di Sistem Manajemen Pesantren
            </p>
          </div>
        </div>
        {teacher && (
          <div className="bg-emerald-50 p-3 rounded-lg mt-4 sm:mt-0">
            <p className="text-emerald-600 text-xs">Selamat datang</p>
            <p className="text-emerald-800 font-bold">{teacher.name}</p>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-700 text-white rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-emerald-800 font-semibold text-sm">Total Santri</p>
              <p className="text-3xl font-bold text-emerald-900">{students.length}</p>
              {classData && (
                <p className="text-xs text-emerald-600">
                  Kelas {classData.class_name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 text-white rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-emerald-800 font-semibold text-sm">Rata-rata Hafalan</p>
              <p className="text-3xl font-bold text-emerald-900">
                {dashboardData?.averageMemorization.toFixed(1) || 0}
              </p>
              <p className="text-xs text-emerald-600">halaman/minggu</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-amber-500 text-white rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-emerald-800 font-semibold text-sm">Kehadiran</p>
              <p className="text-3xl font-bold text-emerald-900">
                {dashboardData?.attendanceRate.toFixed(1) || 0}%
              </p>
              <p className="text-xs text-emerald-600">hari ini</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and top students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-emerald-800 flex items-center">
              <div className="w-1 h-5 bg-emerald-600 rounded-full mr-2"></div>
              Perkembangan Mingguan
            </h3>
            <p className="text-sm text-emerald-600 ml-3">
              Rata-rata capaian hafalan dan belajar santri per minggu
            </p>
          </div>
          <div className="p-4">
            <Bar 
              data={weeklyData} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      padding: 15,
                      font: {
                        size: 11
                      }
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    }
                  },
                  y: {
                    grid: {
                      color: '#f0fdfa',
                    },
                    ticks: {
                      stepSize: 5,
                    }
                  }
                }
              }} 
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-emerald-800 flex items-center">
              <div className="w-1 h-5 bg-emerald-600 rounded-full mr-2"></div>
              Santri Berprestasi
            </h3>
            <p className="text-sm text-emerald-600 ml-3">
              Pencapaian akademik dan hafalan terbaik minggu ini
            </p>
          </div>
          <div className="p-4 space-y-3">
            {(dashboardData?.topStudents || []).map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">{student.name}</p>
                    <p className="text-xs text-emerald-600">Kelas {student.class_name}</p>
                  </div>
                </div>
                <div className="text-emerald-700 font-medium text-sm">
                  {student.achievement}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducatorDashboard;
