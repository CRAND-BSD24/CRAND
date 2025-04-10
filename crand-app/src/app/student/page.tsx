"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import { User, Users, BookOpen, Calendar } from "lucide-react";

// Import dan daftarkan elemen Chart.js
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
import { getDashboardData } from "./action";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
  averageMemorization: number;
  totalMemorizationThisWeek: number;
  attendanceRate: number;
  presentDaysThisWeek: number;
  totalWorkingDays: number;
  weeklyProgress: {
    memorization: number[];
    academic: number[];
  };
}

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
        label: "Akademik (nilai)",
        data: dashboardData?.weeklyProgress.academic || [0, 0, 0, 0],
        backgroundColor: "#22C55E",
      },
    ],
  };

  const hafalanData = {
    labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
    datasets: [
      {
        label: "Hafalan (halaman)",
        data: dashboardData?.weeklyProgress.memorization || [0, 0, 0, 0],
        backgroundColor: "#4F46E5",
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#e0e0e0] to-[#e6e6e6] p-6 space-y-8">
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <h1 className="text-3xl font-bold text-black mb-2">Dashboard Santri</h1>
        <p className="text-black">
          Selamat datang di Sistem Manajemen Pesantren. Pantau perkembangan Anda di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 border-none bg-white/70 backdrop-blur-sm hover:bg-white/90">
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-3 rounded-xl bg-[#0a5c36]/10 group-hover:bg-[#0a5c36]/20 transition-colors">
              <BookOpen className="w-8 h-8 text-black" />
            </div>
            <div>
              <p className="text-lg font-semibold text-black group-hover:text-black transition-colors">Rata-rata Hafalan</p>
              <p className="text-2xl font-bold">
                {dashboardData?.averageMemorization.toFixed(1) || 0}
              </p>
              <p className="text-sm text-[#9ca3af]">halaman/setoran</p>
              <p className="text-sm text-gray-500 mt-1">
                Total minggu ini:{" "}
                {dashboardData?.totalMemorizationThisWeek || 0} halaman
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="group hover:shadow-lg transition-all duration-300 border-none bg-white/70 backdrop-blur-sm hover:bg-white/90">
          <CardContent className="flex items-center space-x-4 p-6">
            <div className="p-3 rounded-xl bg-[#0b6e41]/10 group-hover:bg-[#0b6e41]/20 transition-colors">
              <Calendar className="w-8 h-8 text-black" />
            </div>
            <div>
              <p className="text-lg font-semibold text-black group-hover:text-black transition-colors">Kehadiran</p>
              <p className="text-2xl font-bold">
                {dashboardData?.attendanceRate.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-[#9ca3af]">minggu ini</p>
              <p className="text-sm text-gray-500 mt-1">
                {dashboardData?.presentDaysThisWeek || 0} dari{" "}
                {dashboardData?.totalWorkingDays || 5} hari
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 flex-1">
        <Card className="flex-1 flex flex-col bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 border-none hover:shadow-lg">
          <CardHeader>
            <CardTitle>Perkembangan Hafalan Mingguan</CardTitle>
            <p className="text-sm text-[#9ca3af]">
              Rata-rata capaian hafalan santri per minggu
            </p>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-full">
              <Bar
                data={hafalanData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: 'black',
                        font: {
                          family: 'system-ui'
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'white',
                      titleColor: 'black',
                      bodyColor: 'black',
                      borderColor: '#e5e7eb',
                      borderWidth: 1,
                      padding: 16,
                      displayColors: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: '#e5e7eb' },
                      ticks: { color: 'black' },
                      title: {
                        display: true,
                        text: "Halaman",
                        color: 'black',
                        font: {
                          weight: 'bold'
                        }
                      },
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: 'black' },
                      title: {
                        display: true,
                        text: "Minggu",
                        color: 'black',
                        font: {
                          weight: 'bold'
                        }
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
