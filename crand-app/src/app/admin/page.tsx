"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Line } from "react-chartjs-2";
import { User, Users, Calendar } from "lucide-react";

// Import dan daftarkan elemen Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import {
  getAllTeachers,
  getAllStudents,
  getTeacherAttendanceStats,
  getMonthlyStats,
} from "./action";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    averageAttendance: 0,
    chartData: {
      labels: [],
      data: [],
    },
  });
  const [monthlyStats, setMonthlyStats] = useState({
    labels: [],
    teacherData: [],
    studentData: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const studentsResponse = await getAllStudents();
      const teachersResponse = await getAllTeachers();
      const attendanceResponse = await getTeacherAttendanceStats();
      const monthlyStatsResponse = await getMonthlyStats();

      const studentsData = JSON.parse(studentsResponse);
      const teachersData = JSON.parse(teachersResponse);
      const attendanceData = JSON.parse(attendanceResponse);
      const monthlyData = JSON.parse(monthlyStatsResponse);

      setStudents(studentsData);
      setTeachers(teachersData);
      setAttendanceStats(attendanceData);
      setMonthlyStats(monthlyData);
    };

    fetchData();
  }, []);

  const weeklyData = {
    labels: attendanceStats.chartData.labels,
    datasets: [
      {
        label: "Persentase Kehadiran Guru",
        data: attendanceStats.chartData.data,
        backgroundColor: "#4F46E5",
      },
    ],
  };

  const monthlyData = {
    labels: monthlyStats.labels,
    datasets: [
      {
        label: "Total Guru",
        data: monthlyStats.teacherData,
        borderColor: "#22C55E",
        backgroundColor: "#22C55E",
        tension: 0.4,
      },
      {
        label: "Total Santri",
        data: monthlyStats.studentData,
        borderColor: "#4F46E5",
        backgroundColor: "#4F46E5",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex flex-col space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-blue-600 font-medium">
            Selamat datang di Sistem Manajemen Pesantren
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                    Total Santri
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {students.length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                    Total Ustadz
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {teachers.length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                    Rata-rata Kehadiran Guru
                  </p>
                  <div className="space-y-1">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {attendanceStats.averageAttendance}%
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">per hari</p>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="p-4 sm:p-6 pb-0">
              <div className="space-y-1">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                  Statistik Kehadiran Guru
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-500">
                  Persentase kehadiran guru dalam 7 hari terakhir
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Bar
                data={weeklyData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom" as const,
                      labels: {
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12
                        }
                      }
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        display: true,
                        color: "rgba(0,0,0,0.05)",
                      },
                      ticks: {
                        callback: function (value) {
                          return value + "%";
                        },
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12,
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12,
                        },
                      },
                    },
                  },
                }}
                className="h-[250px] sm:h-[300px]"
              />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="p-4 sm:p-6 pb-0">
              <div className="space-y-1">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                  Statistik Total Guru dan Santri
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-500">
                  Perkembangan jumlah guru dan santri dalam 12 bulan terakhir
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Line
                data={monthlyData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom" as const,
                      labels: {
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12
                        }
                      }
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: "rgba(0,0,0,0.05)",
                      },
                      ticks: {
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12,
                        },
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12,
                        },
                      },
                    },
                  },
                }}
                className="h-[250px] sm:h-[300px]"
              />
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default AdminDashboard;
