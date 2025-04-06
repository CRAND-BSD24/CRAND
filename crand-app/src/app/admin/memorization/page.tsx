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
      const parsedData: MemorizationGrade[] =
        typeof result === 'string' ? JSON.parse(result) : result;

      setData(parsedData);
    };

    fetchData();
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'proses':
        return 'bg-yellow-100 text-yellow-800';
      case 'belum':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0] p-6">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-3xl p-8 border border-[#89C0C3]">
        <h1 className="text-4xl font-extrabold text-center text-[#02676C] mb-8">
          Hafalan Santri
        </h1>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full bg-white text-sm text-left text-gray-700">
            <thead className="bg-[#E0F4F5] text-gray-800 text-base">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Santri</th>
                <th className="px-5 py-3">Hafalan</th>
                <th className="px-5 py-3">Halaman</th>
                <th className="px-5 py-3">Catatan</th>
                <th className="px-5 py-3">Semester</th>
                <th className="px-5 py-3">Tahun</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-[#f8fafa] transition-all"
                  >
                    <td className="px-5 py-3">{index + 1}</td>
                    <td className="px-5 py-3 font-semibold text-[#02676C]">
                      {item.student_name}
                    </td>
                    <td className="px-5 py-3">{item.memorization_name}</td>
                    <td className="px-5 py-3">{item.pages}</td>
                    <td className="px-5 py-3 italic">{item.notes}</td>
                    <td className="px-5 py-3">{item.semester}</td>
                    <td className="px-5 py-3">{item.academic_year}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-3 py-1 rounded-full font-semibold text-xs ${getStatusBadgeColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-6 text-gray-500 font-medium"
                  >
                    Tidak ada data hafalan 💤
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
