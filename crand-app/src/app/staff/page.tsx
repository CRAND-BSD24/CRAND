"use client";

import { Users, BookOpen, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

const BarChart = dynamic(
  async () => {
    const [{ Bar }, chartJs] = await Promise.all([
      import("react-chartjs-2"),
      import("chart.js"),
    ]);

    const {
      Chart: ChartJS,
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend,
    } = chartJs;

    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend
    );

    return function WrappedBarChart(props: any) {
      return <Bar {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[250px] text-sm text-blue-700">
        Memuat grafik...
      </div>
    ),
  }
);

const StaffDashboard = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  // Mock data for UI replication
  const [stats] = useState({
    totalAttendance: 24,
    avgWorkHours: 8.5,
    remainingLeave: 12
  });

  const [weeklyData] = useState({
    labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
    datasets: [
      {
        label: "Kehadiran Tepat Waktu",
        data: [5, 6, 5, 5],
        backgroundColor: "#047857",
        borderRadius: 4,
        maxBarThickness: 35,
      },
      {
        label: "Keterlambatan (menit)",
        data: [10, 5, 0, 15],
        backgroundColor: "#0284c7",
        borderRadius: 4,
        maxBarThickness: 35,
      },
    ],
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e2f6f4] flex items-center justify-center px-4 lg:pl-64 pt-16">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-800 rounded-full animate-spin mb-4"></div>
          <div className="text-blue-800 text-base font-medium">Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-700 text-white rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-800">Dashboard Staff</h1>
            <p className="text-blue-600 text-sm">
              Selamat datang di Sistem Manajemen Pesantren
            </p>
          </div>
        </div>
        {session?.user && (
          <div className="bg-blue-50 p-3 rounded-lg mt-4 sm:mt-0">
            <p className="text-blue-600 text-xs">Selamat datang</p>
            <p className="text-blue-800 font-bold">{session.user.name}</p>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-700 text-white rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-blue-800 font-semibold text-sm">Total Kehadiran</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalAttendance}</p>
              <p className="text-xs text-blue-600">
                Bulan ini
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 text-white rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-blue-800 font-semibold text-sm">Rata-rata Jam Kerja</p>
              <p className="text-3xl font-bold text-blue-900">
                {stats.avgWorkHours}
              </p>
              <p className="text-xs text-blue-600">jam/hari</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-amber-500 text-white rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-blue-800 font-semibold text-sm">Sisa Cuti</p>
              <p className="text-3xl font-bold text-blue-900">
                {stats.remainingLeave}
              </p>
              <p className="text-xs text-blue-600">hari</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-blue-800 flex items-center">
              <div className="w-1 h-5 bg-blue-600 rounded-full mr-2"></div>
              Statistik Kehadiran
            </h3>
            <p className="text-sm text-blue-600 ml-3">
              Grafik kehadiran dan keterlambatan per minggu
            </p>
          </div>
          <div className="p-4">
            <BarChart
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
                    titleFont: {
                      size: 13
                    },
                    bodyFont: {
                      size: 12
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
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  },
                  x: {
                    ticks: {
                      font: {
                        size: 11
                      }
                    },
                    grid: {
                      display: false
                    }
                  }
                }
              }} 
              height={250}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-blue-800 flex items-center">
              <div className="w-1 h-5 bg-amber-500 rounded-full mr-2"></div>
              Riwayat Absensi Terakhir
            </h3>
            <p className="text-sm text-blue-600 ml-3">
              5 aktivitas absensi terakhir Anda
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-bold text-blue-800">Absensi Masuk</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-blue-600">
                      Senin, {20 + i} Februari 2024
                    </p>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Tepat Waktu
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
