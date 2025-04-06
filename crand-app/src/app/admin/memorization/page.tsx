'use client';
import React, { useEffect, useState } from 'react';
import { getAllMemorizationGrades } from './action';

interface MemorizationGrade {
  _id: string;
  student_name: string;
  memorization_name: string;
  pages: number;
  notes: string;
  semester: string;
  academic_year: string;
  status: string;
}

export default function HafalanPage() {
  const [data, setData] = useState<MemorizationGrade[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getAllMemorizationGrades();
      const parsedData: MemorizationGrade[] = typeof result === 'string' ? JSON.parse(result) : result;

      setData(parsedData);
      console.log(parsedData, 'ini data hafalan page');
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Data Hafalan Santri</h1>
      <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
        <table className="min-w-full table-auto border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2 text-left">#</th>
              <th className="border px-4 py-2 text-left">Santri</th>
              <th className="border px-4 py-2 text-left">Hafalan</th>
              <th className="border px-4 py-2 text-left">Halaman</th>
              <th className="border px-4 py-2 text-left">Catatan</th>
              <th className="border px-4 py-2 text-left">Semester</th>
              <th className="border px-4 py-2 text-left">Tahun</th>
              <th className="border px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{item.student_name}</td>
                <td className="border px-4 py-2">{item.memorization_name}</td>
                <td className="border px-4 py-2">{item.pages}</td>
                <td className="border px-4 py-2">{item.notes}</td>
                <td className="border px-4 py-2">{item.semester}</td>
                <td className="border px-4 py-2">{item.academic_year}</td>
                <td className="border px-4 py-2">{item.status}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  Tidak ada data hafalan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
