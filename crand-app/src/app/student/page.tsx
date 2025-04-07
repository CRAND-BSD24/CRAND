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
import { getAllTeachers, getAllStudents } from "./action"


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
    <div className="space-y-6 bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0] h-full-screen m-5 max-h-fit">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600">
        Selamat datang di Sistem Manajemen Pesantren.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-14">
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

      <div className="grid grid-cols-1 grid-rows-1 gap-1">
        <div>
          <h1>
            
          </h1>
        </div>
        <Card className=" size-280 h-170">
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
      </div>
    </div>
  );
};

export default AdminDashboard;
