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
import { getAllTeachers, getAllStudents } from "./action";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  useEffect(() => {
    
    const fetchStudents = async () => {
      const response = await getAllStudents();
      const data = JSON.parse(response);
      console.log(data);
      
      setStudents(data);
    };

    const fetchTeachers = async () => {
      const response = await getAllTeachers();
      const data = JSON.parse(response);
      
      setTeachers(data);
    };

    fetchStudents();
    fetchTeachers();
  }, [])

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
    <div className="p-8 min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-emerald-600 font-medium">
            Selamat datang di Sistem Manajemen Pesantren
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-500">Total Santri</p>
                  <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-500">Total Ustadz</p>
                  <p className="text-3xl font-bold text-gray-900">{teachers.length}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <User className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-500">Rata-rata Hafalan</p>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">3.2</p>
                    <p className="text-sm text-gray-500">halaman/minggu</p>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-500">Kehadiran</p>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">98.2%</p>
                    <p className="text-sm text-emerald-600 font-medium">+2.1% dari minggu lalu</p>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="p-6 pb-0">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-gray-900">Perkembangan Mingguan</CardTitle>
                <p className="text-sm text-gray-500">
                  Rata-rata capaian hafalan dan belajar santri per minggu
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Bar data={weeklyData} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                      color: 'rgba(0,0,0,0.05)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }} />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="p-6 pb-0">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-gray-900">Santri Berprestasi Minggu Ini</CardTitle>
                <p className="text-sm text-gray-500">
                  Santri dengan pencapaian terbaik
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="divide-y divide-gray-100">
                {topStudents.map((student, index) => (
                  <li key={index} className="flex items-center gap-4 py-3 group first:pt-0 last:pb-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-medium text-lg group-hover:scale-105 transition-transform duration-200">
                      {student.name[0]}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.class}</p>
                      <p className="text-sm font-medium text-emerald-600">
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
    </div>
  );
};

export default AdminDashboard;
