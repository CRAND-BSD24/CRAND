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

  const akademikData = {
    labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
    datasets: [
      {
        label: "Akademik (nilai)",
        data: dashboardData?.weeklyProgress.academic || [0, 0, 0, 0],
        backgroundColor: "#22C55E",
      },
    ],
  };

  return (
    <div className="flex flex-col h-screen space-y-6 bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0] p-5">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Selamat datang di Sistem Manajemen Pesantren.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-14">
        <Card>
          <CardContent className="flex items-center space-x-4">
            <BookOpen className="text-purple-500 w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">Rata-rata Hafalan</p>
              <p className="text-2xl font-bold">
                {dashboardData?.averageMemorization.toFixed(1) || 0}
              </p>
              <p className="text-sm text-gray-500">halaman/setoran</p>
              <p className="text-sm text-gray-500 mt-1">
                Total minggu ini:{" "}
                {dashboardData?.totalMemorizationThisWeek || 0} halaman
              </p>
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
              <p className="text-sm text-gray-500">minggu ini</p>
              <p className="text-sm text-gray-500 mt-1">
                {dashboardData?.presentDaysThisWeek || 0} dari{" "}
                {dashboardData?.totalWorkingDays || 5} hari
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Perkembangan Hafalan Mingguan</CardTitle>
            <p className="text-sm text-gray-500">
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
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Halaman",
                      },
                    },
                    x: {
                      title: {
                        display: true,
                        text: "Minggu",
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Perkembangan Akademik Mingguan</CardTitle>
            <p className="text-sm text-gray-500">
              Rata-rata capaian akademik santri per minggu
            </p>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-full">
              <Bar
                data={akademikData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Nilai",
                      },
                    },
                    x: {
                      title: {
                        display: true,
                        text: "Minggu",
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
