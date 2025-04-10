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
      },
      {
        label: "Belajar (nilai)",
        data: dashboardData?.weeklyProgress.academic || [0, 0, 0, 0],
        backgroundColor: "#059669",
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4 lg:pl-64 pt-16">
        <div className="text-emerald-800 text-base sm:text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="lg:pl-64 pt-16">
        <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 lg:p-8 border-t-4 border-emerald-800 transition-all duration-300 hover:shadow-emerald-200/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Dashboard Ustadz
                </h1>
                <p className="text-emerald-600 mt-1 text-sm sm:text-base">
                  Selamat datang di Sistem Manajemen Pesantren
                </p>
              </div>
              {teacher && (
                <div className="w-full sm:w-auto bg-emerald-50 p-2.5 sm:p-3 rounded-xl border border-emerald-100">
                  <p className="text-emerald-600 text-xs sm:text-sm">Selamat datang</p>
                  <p className="text-emerald-800 font-bold text-base sm:text-lg">{teacher.name}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:p-4 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 lg:p-3 bg-emerald-800 rounded-lg text-white">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div>
                    <p className="text-emerald-800 font-semibold text-sm sm:text-base">Total Santri</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900">{students.length}</p>
                    {classData && (
                      <p className="text-xs sm:text-sm text-emerald-600">
                        Kelas {classData.class_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:p-4 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 lg:p-3 bg-emerald-800 rounded-lg text-white">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div>
                    <p className="text-emerald-800 font-semibold text-sm sm:text-base">Rata-rata Hafalan</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900">
                      {dashboardData?.averageMemorization.toFixed(1) || 0}
                    </p>
                    <p className="text-xs sm:text-sm text-emerald-600">halaman/minggu</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:p-4 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 lg:p-3 bg-emerald-800 rounded-lg text-white">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div>
                    <p className="text-emerald-800 font-semibold text-sm sm:text-base">Kehadiran</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900">
                      {dashboardData?.attendanceRate.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs sm:text-sm text-emerald-600">hari ini</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow duration-200">
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-emerald-800">Perkembangan Mingguan</h3>
                  <p className="text-xs sm:text-sm text-emerald-600">
                    Rata-rata capaian hafalan dan belajar santri per minggu
                  </p>
                </div>
                <div className="p-2 sm:p-3 lg:p-4">
                  <Bar data={weeklyData} options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                        labels: {
                          boxWidth: 12,
                          padding: 15,
                          font: {
                            size: 12
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          font: {
                            size: 11
                          }
                        }
                      },
                      x: {
                        ticks: {
                          font: {
                            size: 11
                          }
                        }
                      }
                    }
                  }} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow duration-200">
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-emerald-800">
                    Santri Kelas {classData?.class_name} Berprestasi Minggu Ini
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-600">
                    Santri dengan pencapaian hafalan terbaik
                  </p>
                </div>
                
                {dashboardData?.topStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 sm:h-40 lg:h-48 text-emerald-600 bg-emerald-50/50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mb-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-center text-sm sm:text-base">Tidak ada santri yang setor hafalan minggu ini</p>
                  </div>
                ) : (
                  <ul className="space-y-2 sm:space-y-3">
                    {dashboardData?.topStudents.map((student, index) => (
                      <li key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-emerald-50 transition-colors">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 font-semibold text-xs sm:text-sm lg:text-base">
                          {student.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-800 text-sm sm:text-base">{student.name}</p>
                          <p className="text-xs text-emerald-600">
                            {student.class_name}
                          </p>
                          <p className="text-xs sm:text-sm text-emerald-700 font-medium">
                            {student.achievement}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TeacherDashboard;
