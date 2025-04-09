"use client";

import React, { useEffect, useState } from "react";
import { getAllTeachers, deleteTeacher } from "./action";
import { AddTeacherModal, EditTeacherModal } from "@/components/AddTeacherModal";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTeachers = async () => {
    try {
      const response = await getAllTeachers();
      const data = JSON.parse(response);
      setTeachers(data);
      setFilteredTeachers(data);
      setCurrentPage(1); // Reset to first page when data changes
    } catch (error) {
      console.error("Gagal mengambil data ustadz:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = teachers.filter((teacher) =>
      teacher.name.toLowerCase().includes(query.toLowerCase()) ||
      teacher.phone_number.toLowerCase().includes(query.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(query.toLowerCase()) ||
      teacher.nip?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTeachers(filtered);
    setCurrentPage(1); // Reset to first page when search changes
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTeachers = filteredTeachers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#9ACBD0] to-[#48A6A7] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#006A71]">Manajemen Data Ustadz</h1>
              <p className="text-gray-600 mt-1">Kelola data ustadz dengan mudah</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#006A71] text-white px-6 py-2 rounded-lg hover:bg-[#04888b] transition-colors flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Tambah Ustadz
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari ustadz..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full md:w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-[#48A6A7] text-white">
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Nama</th>
                  <th className="px-6 py-4 text-left">Nomor Telepon</th>
                  <th className="px-6 py-4 text-left">Alamat</th>
                  <th className="px-6 py-4 text-left">NIP</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentTeachers.map((teacher, index) => (
                  <tr
                    key={teacher._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">{startIndex + index + 1}</td>
                    <td className="px-6 py-4 font-medium">{teacher.name}</td>
                    <td className="px-6 py-4">{teacher.phone_number}</td>
                    <td className="px-6 py-4">{teacher.address || "-"}</td>
                    <td className="px-6 py-4">{teacher.nip || "-"}</td>
                    <td className="px-6 py-4">{teacher.email || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditTeacher(teacher)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(teacher._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentTeachers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "Tidak ada hasil pencarian"
                        : "Tidak ada data ustadz yang tersedia"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredTeachers.length)} dari {filteredTeachers.length} data
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? "bg-[#006A71] text-white"
                        : "border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
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