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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const weeklyData = {
    labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
    datasets: [
      {
        label: "Hafalan (halaman)",
        data: [2.0, 3.0, 2.5, 3.8],
        backgroundColor: "#4F46E5",
      },
      {
        label: "Belajar (nilai)",
        data: [1.8, 2.9, 2.7, 3.5],
        backgroundColor: "#22C55E",
      },
    ],
  };

  const topStudents = [
    {
      name: "Ahmad Farhan",
      class: "Kelas 10A",
      achievement: "7 halaman hafalan",
    },
    {
      name: "Fatimah Azzahra",
      class: "Kelas 11B",
      achievement: "Nilai ujian 98",
    },
    {
      name: "Muhammad Rizky",
      class: "Kelas 12A",
      achievement: "5 halaman hafalan",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600">
        Selamat datang di Sistem Manajemen Pesantren.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center space-x-4">
            <Users className="text-blue-500 w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">Total Santri</p>
              <p className="text-2xl font-bold">245</p>
              <p className="text-sm text-gray-500">+12 bulan ini</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4">
            <User className="text-green-500 w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">Total Ustadz</p>
              <p className="text-2xl font-bold">32</p>
              <p className="text-sm text-gray-500">+2 bulan ini</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4">
            <BookOpen className="text-purple-500 w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">Rata-rata Hafalan</p>
              <p className="text-2xl font-bold">3.2</p>
              <p className="text-sm text-gray-500">halaman/minggu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center space-x-4">
            <Calendar className="text-orange-500 w-8 h-8" />
            <div>
              <p className="text-lg font-semibold">Kehadiran</p>
              <p className="text-2xl font-bold">98.2%</p>
              <p className="text-sm text-gray-500">+2.1% dari minggu lalu</p>
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
              {topStudents.map((student, index) => (
                <li key={index} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                    {student.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.class}</p>
                    <p className="text-sm text-gray-700">
                      {student.achievement}
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

export default AdminDashboard;
