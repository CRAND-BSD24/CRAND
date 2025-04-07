"use client";

import React, { useEffect, useState } from "react";
import { getAllStudents, promoteStudentsByClass } from "./action";
import Link from "next/link";
import AddStudentModal from "./AddStudentModal";

interface Student {
  _id: string;
  name: string;
  class: string;
  academic_level: string;
  gender: string;
  parent_name: string;
  batch_year: number;
  birth_date?: string;
  birth_place?: string;
  address?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
  graduation_status?: string;
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filterClass, setFilterClass] = useState<string>("");

  const fetchStudents = async () => {
    try {
      const response = await getAllStudents();
      const data = JSON.parse(response);
      setStudents(data);
    } catch (error) {
      console.error("Gagal mengambil data santri:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handlePromoteByClass = async () => {
    if (!filterClass) return alert("Pilih kelas terlebih dahulu ya");

    const confirmed = confirm(
      `Yakin ingin menaikkan semua santri di kelas ${filterClass}?`
    );
    if (!confirmed) return;

    const success = await promoteStudentsByClass(filterClass);
    if (success) {
      alert(
        `Santri di kelas ${filterClass} berhasil dinaikkan ke tingkat selanjutnya!`
      );
      fetchStudents();
      setFilterClass(""); // Reset filter setelah promote
    } else {
      alert("Gagal menaikkan kelas santri.");
    }
  };

  const filteredStudents = students.filter((s) =>
    filterClass === "" ? true : s.class === filterClass
  );

  const uniqueClasses = Array.from(
    new Set(students.map((s) => s.class).filter(Boolean))
  ).sort();

  return (
    <div className="p-8 bg-[#9ACBD0] min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-12">
        <h1 className="text-3xl font-bold text-[#006A71] mb-8 text-center">
          Manajemen Data Santri
        </h1>

        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-[#006A71]">
            Daftar Santri
          </h2>
          <AddStudentModal onStudentAdded={fetchStudents} />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Pilih Kelas</option>
            {uniqueClasses.map((kelas, index) => (
              <option key={`${kelas}-${index}`} value={kelas}>
                {kelas}
              </option>
            ))}
          </select>

          <button
            onClick={handlePromoteByClass}
            disabled={!filterClass}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Naikkan Semua di Kelas Ini
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-[#48A6A7] text-white">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Tingkat Akademik</th>
                <th className="px-4 py-3">Tahun Angkatan</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr
                  key={student._id}
                  className="bg-[#f9fdfd] hover:bg-[#e0f4f4] transition-colors rounded-md shadow-sm"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{student.name}</td>
                  <td className="px-4 py-3">{student.class}</td>
                  <td className="px-4 py-3">{student.academic_level}</td>
                  <td className="px-4 py-3">{student.batch_year}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/students/${student._id}`}
                      className="text-[#006A71] font-semibold hover:underline transition-all"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-[#006A71] italic bg-[#f0fafa] rounded-md"
                  >
                    Tidak ada data santri untuk kelas ini.
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

export default StudentsPage;
