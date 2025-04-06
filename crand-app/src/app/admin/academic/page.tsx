"use client";

import React, { useEffect, useState } from "react";
import { getAllGrades } from "./action";

interface Grade {
  _id: string;
  student_name: string;
  subject_name: string;
  semester: string;
  academic_year: string;
  score: number;
}

const AcademicPage = () => {
  const [grades, setGrades] = useState<Grade[]>([]);

  const fetchGrades = async () => {
    const response = await getAllGrades();
    const data = JSON.parse(response);
    setGrades(data); 
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  return (
    <div className="min-h-screen bg-[#9ACBD0] p-6 md:p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10">
        <h1 className="text-3xl font-bold text-[#006A71] mb-6 text-center">
          Akademik Santri
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-xl overflow-hidden shadow-md">
            <thead>
              <tr className="bg-[#B5DAD6] text-[#004D4D]">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Nama Santri</th>
                <th className="px-4 py-3 text-left">Mata Pelajaran</th>
                <th className="px-4 py-3 text-left">Semester</th>
                <th className="px-4 py-3 text-left">Tahun Ajaran</th>
                <th className="px-4 py-3 text-left">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, index) => (
                <tr key={grade._id} className="odd:bg-white even:bg-[#F1F9F9]">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{grade.student_name}</td>
                  <td className="px-4 py-3">{grade.subject_name}</td>
                  <td className="px-4 py-3">{grade.semester}</td>
                  <td className="px-4 py-3">{grade.academic_year}</td>
                  <td className="px-4 py-3">{grade.score}</td>
                </tr>
              ))}
              {grades.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Tidak ada data nilai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AcademicPage;
