"use client";

import React, { useEffect, useState } from "react";
import { getAllStudents, acceptStudent, rejectStudent } from "./action";
import Link from "next/link";
import AddStudentModal from "./AddStudentModal";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";

interface Student {
  _id: string;
  name: string;
  level: string;
}

const PsbPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'accept' | 'reject';
    studentId: string;
  }>({
    isOpen: false,
    type: 'accept',
    studentId: ''
  });

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
    setConfirmModal({
      isOpen: true,
      type: 'accept',
      studentId: id
    });
  };

  const handleReject = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'reject',
      studentId: id
    });
  };

  const handleConfirm = async () => {
    const { type, studentId } = confirmModal;
    
    try {
      if (type === 'accept') {
        const result = await acceptStudent(studentId);
        if (result.success) {
          toast.success("Santri berhasil diterima");
          fetchStudents();
        } else {
          toast.error(result.message || "Gagal menerima santri");
        }
      } else {
        const result = await rejectStudent(studentId);
        if (result.success) {
          toast.success("Santri berhasil ditolak dan dihapus");
          fetchStudents();
        } else {
          toast.error(result.message || "Gagal menolak santri");
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirm}
        title={confirmModal.type === 'accept' ? "Konfirmasi Penerimaan" : "Konfirmasi Penolakan"}
        message={
          confirmModal.type === 'accept'
            ? "Apakah Anda yakin ingin menerima santri ini?"
            : "Apakah Anda yakin ingin menolak dan menghapus data santri ini?"
        }
        confirmText={confirmModal.type === 'accept' ? "Terima" : "Tolak"}
        type={confirmModal.type === 'accept' ? "success" : "danger"}
      />
      
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-8 mt-16 sm:mt-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-6 sm:mb-8 text-center">
          Manajemen Data Penerimaan Santri Baru
        </h1>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-emerald-800">
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
                <th className="px-2 sm:px-4 py-2 sm:py-3 rounded-l-md">#</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3">Nama</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3">Aksi</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 rounded-r-md">Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr
                  key={student._id}
                  className="bg-emerald-50/50 hover:bg-emerald-50/80 transition-colors rounded-md shadow-sm"
                >
                  <td className="px-2 sm:px-4 py-2 sm:py-3">{index + 1}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">{student.name}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <Link
                      href={`/admin/prospective_students/${student._id}`}
                      className="text-emerald-800 font-semibold hover:underline transition-all"
                    >
                      Detail
                    </Link>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="flex flex-col sm:flex-row gap-2">
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
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-4 sm:py-6 text-emerald-800 italic bg-emerald-50/70 rounded-md"
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
