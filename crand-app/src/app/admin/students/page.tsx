'use client';

import React, { useEffect, useState } from 'react';
import { getAllStudents } from './action';
import Link from 'next/link';
import AddStudentModal from './AddStudentModal';

interface Student {
  _id: string;
  name: string;
  level: string;
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);

  const fetchStudents = async () => {
    const response = await getAllStudents();
    const data = JSON.parse(response);
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Santri Management</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Daftar Santri</h2>
          <AddStudentModal onStudentAdded={fetchStudents} />
        </div>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2 text-left">#</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Nama</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Level</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student._id}>
                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">{student.name}</td>
                <td className="border border-gray-300 px-4 py-2">{student.level}</td>
                <td className="border border-gray-300 px-4 py-2 space-x-2">
                  <Link
                    href={`/admin/students/${student._id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  Tidak ada data santri.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsPage;
