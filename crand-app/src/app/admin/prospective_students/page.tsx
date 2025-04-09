"use client";

import React, { useEffect, useState } from "react";
import { getAllStudents, acceptStudent, rejectStudent } from "./action";
import Link from "next/link";
import AddStudentModal from "./AddStudentModal";

interface Student {
  _id: string;
  name: string;
  level: string;
}

const PsbPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStudents = async () => {
    const response = await getAllStudents();
    const data = JSON.parse(response);
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAccept = async (id: string) => {
    const confirmed = confirm("Yakin ingin menerima santri ini?");
    if (!confirmed) return;

    const result = await acceptStudent(id);
    if (result.success) {
      alert("Santri berhasil diterima.");
      fetchStudents(); // Refresh daftar
    } else {
      alert(result.message || "Gagal menerima santri.");
    }
  };

  const handleReject = async (id: string) => {
    const confirmed = confirm(
      "Yakin ingin menolak dan menghapus data santri ini?"
    );
    if (!confirmed) return;

    const result = await rejectStudent(id);
    if (result.success) {
      alert("Santri berhasil ditolak dan dihapus.");
      fetchStudents(); // Refresh daftar
    } else {
      alert(result.message || "Gagal menolak santri.");
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-12">
        <h1 className="text-3xl font-bold text-emerald-800 mb-8 text-center">
          Manajemen Data Penerimaan Santri Baru
        </h1>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-emerald-800">
            Daftar Calon Santri
          </h2>
          <AddStudentModal onStudentAdded={fetchStudents} />
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari nama santri..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-800 transition"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-emerald-800 text-white">
                <th className="px-4 py-3 rounded-l-md">#</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Aksi</th>
                <th className="px-4 py-3 rounded-r-md">Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr
                  key={student._id}
                  className="bg-emerald-50/50 hover:bg-emerald-50/80 transition-colors rounded-md shadow-sm"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{student.name}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/prospective_students/${student._id}`}
                      className="text-emerald-800 font-semibold hover:underline transition-all"
                    >
                      Detail
                    </Link>
                  </td>
                  <td className="px-4 py-3 space-x-2 flex flex-wrap">
                    <button
                      onClick={() => handleAccept(student._id)}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow transition-transform transform hover:scale-105"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(student._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow transition-transform transform hover:scale-105"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-6 text-emerald-800 italic bg-emerald-50/70 rounded-md"
                  >
                    {searchQuery ? "Tidak ada hasil pencarian." : "Tidak ada data santri."}
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

export default PsbPage;
