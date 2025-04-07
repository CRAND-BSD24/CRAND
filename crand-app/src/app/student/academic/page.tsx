"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Grade {
  _id: string;
  student_name: string;
  subject_name: string;
  semester: string;
  academic_year: string;
  score: number;
}

// Simulasi data user yang sedang login
const currentUser = {
  role: "student",
  name: "Ahmad Fauzi", // ganti sesuai nama di data dummy
};

// Simulasi data nilai
const dummyGrades: Grade[] = [
  {
    _id: "1",
    student_name: "Ahmad Fauzi",
    subject_name: "Matematika",
    semester: "Ganjil",
    academic_year: "2024/2025",
    score: 89,
  },
  {
    _id: "2",
    student_name: "Budi Santoso",
    subject_name: "Bahasa Arab",
    semester: "Genap",
    academic_year: "2023/2024",
    score: 85,
  },
];

const AcademicPage = () => {
  const [grade, setGrade] = useState<Grade | null>(null);

  useEffect(() => {
    // Ambil data berdasarkan user yang login
    if (currentUser.role === "student") {
      const userGrade = dummyGrades.find(
        (g) => g.student_name === currentUser.name
      );
      setGrade(userGrade || null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#9ACBD0] flex items-center justify-center p-6">
      <Card className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-[#48A6A7]">
        <h1 className="text-2xl font-bold text-[#006A71] mb-6 text-center">
          Nilai Akademik
        </h1>
        {grade ? (
          <div className="space-y-4 text-[#004D4D]">
            <div className="flex justify-between">
              <span className="font-semibold">Nama Santri:</span>
              <span>{grade.student_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Mata Pelajaran:</span>
              <span>{grade.subject_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Semester:</span>
              <span>{grade.semester}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Tahun Ajaran:</span>
              <span>{grade.academic_year}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#006A71] border-t pt-4">
              <span>Nilai:</span>
              <span>{grade.score}</span>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Tidak ada data nilai tersedia.</p>
        )}
      </Card>
    </div>
  );
};

export default AcademicPage;
