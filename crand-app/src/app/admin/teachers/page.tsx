"use client";

import React, { useEffect, useState } from "react";
import { getAllTeachers, deleteTeacher } from "./action";
import { AddTeacherModal, EditTeacherModal } from "@/components/AddTeacherModal";

interface Teacher {
  _id: string;
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
  nip?: string;
  user_id?: string;
}

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchTeachers = async () => {
    try {
      const response = await getAllTeachers();
      const data = JSON.parse(response);
      setTeachers(data);
    } catch (error) {
      console.error("Gagal mengambil data ustadz:", error);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Yakin ingin menghapus ustadz ini?");
    if (!confirmed) return;

    try {
      await deleteTeacher(id);
      fetchTeachers();
    } catch (error) {
      console.error("Gagal hapus ustadz:", error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <div className="p-8 bg-[#9ACBD0] min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-12">
        <h1 className="text-3xl font-bold text-[#006A71] mb-8 text-center">
          Manajemen Data Ustadz
        </h1>

        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-[#006A71]">Daftar Ustadz</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#006A71] text-white px-4 py-2 rounded-lg hover:bg-[#04888b]"
          >
            + Tambah Ustadz
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-[#48A6A7] text-white">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Nomor Telepon</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3">NIP</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr
                  key={teacher._id}
                  className="bg-[#f9fdfd] hover:bg-[#e0f4f4] transition-colors rounded-md shadow-sm"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{teacher.name}</td>
                  <td className="px-4 py-3">{teacher.phone_number}</td>
                  <td className="px-4 py-3">{teacher.address || "-"}</td>
                  <td className="px-4 py-3">{teacher.nip || "-"}</td>
                  <td className="px-4 py-3">{teacher.email || "-"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => setEditTeacher(teacher)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(teacher._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-6 text-[#006A71] italic bg-[#f0fafa] rounded-md"
                  >
                    Tidak ada data ustadz yang tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddTeacherModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchTeachers}
        />
      )}

      {editTeacher && (
        <EditTeacherModal
          teacher={editTeacher}
          onClose={() => setEditTeacher(null)}
          onSuccess={fetchTeachers}
        />
      )}
    </div>
  );
};

export default TeachersPage;