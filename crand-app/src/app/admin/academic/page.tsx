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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Akademik Santri</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Daftar Nilai</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2 text-left">#</th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Student ID
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Subject ID
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Semester
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Tahun Ajaran
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Nilai
              </th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade, index) => (
              <tr key={grade._id}>
                <td className="border border-gray-300 px-4 py-2">
                  {index + 1}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {grade.student_name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {grade.subject_name}
                </td>

                <td className="border border-gray-300 px-4 py-2">
                  {grade.semester}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {grade.academic_year}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {grade.score}
                </td>
              </tr>
            ))}
            {grades.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Tidak ada data nilai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AcademicPage;
