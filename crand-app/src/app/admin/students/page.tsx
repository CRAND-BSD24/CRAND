"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getAllStudents, promoteStudentsByClassId } from "./action";
import Link from "next/link";
import AddStudentModal from "./AddStudentModal";
import PromoteClassModal from "./PromoteClassModal";
import { toast } from "sonner";

interface Student {
  _id: string;
  name: string;
  nisn: string;
  class_id: string;
  academic_level: string;
  gender: string;
  parent_name: string;
  birth_date?: string;
  birth_place?: string;
  address?: string;
  phone_number?: string;
  class_name?: string;
  created_at?: string;
  updated_at?: string;
  graduation_status?: string;
}

type SortField = "name" | "class_name" | "academic_level" | "gender" | "nisn";
type SortOrder = "asc" | "desc";

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filterClass, setFilterClass] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("nisn");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

  const fetchStudents = useCallback(
    async (field: SortField = sortField, order: SortOrder = sortOrder) => {
      try {
        const response = await getAllStudents(undefined, field, order);
        const data = JSON.parse(response);
        setStudents(data);
      } catch (error) {
        console.error("Gagal mengambil data santri:", error);
        toast.error("Gagal mengambil data santri. Silakan coba lagi.");
      }
    },
    [sortField, sortOrder]
  );

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      const data = await response.json();
      console.log("Classes fetched:", data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Gagal memuat data kelas. Silakan coba lagi.");
    }
  };

  useEffect(() => {
    fetchStudents(sortField, sortOrder);
  }, [sortField, sortOrder, fetchStudents]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const handlePromoteByClass = async () => {
    if (!filterClass) {
      toast.warning("Pilih kelas terlebih dahulu ya");
      return;
    }
    setIsPromoteModalOpen(true);
  };

  const handlePromoteConfirm = async () => {
    const success = await promoteStudentsByClassId(filterClass);
    if (success) {
      toast.success(
        `Santri di kelas ${filterClass} berhasil dinaikkan ke tingkat selanjutnya!`
      );
      fetchStudents();
      setFilterClass("");
    } else {
      toast.error("Gagal menaikkan kelas santri.");
    }
    setIsPromoteModalOpen(false);
  };

  const filteredStudents = students.filter((s) => {
    const matchClass = filterClass === "" || s.class_name === filterClass;
    const matchSearch =
      searchQuery === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchQuery.toLowerCase());

    return matchClass && matchSearch;
  });

  const uniqueClasses = Array.from(
    new Set(students.map((s) => s.class_name).filter(Boolean))
  ).sort();

  const handleSort = (field: SortField) => {
    const newOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField === field) {
      return sortOrder === "asc" ? " ▲" : " ▼";
    }
    return "";
  };

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

        <div className="flex items-center gap-4 mb-4 flex-wrap">
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

          <input
            type="text"
            placeholder="Cari nama santri..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded flex-grow max-w-md"
          />

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
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort("nisn")}
                >
                  NISN{getSortIndicator("nisn")}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Nama{getSortIndicator("name")}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort("class_name")}
                >
                  Kelas{getSortIndicator("class_name")}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort("academic_level")}
                >
                  Jenjang Akademik{getSortIndicator("academic_level")}
                </th>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort("gender")}
                >
                  Jenis Kelamin{getSortIndicator("gender")}
                </th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student._id}
                  className="bg-[#f9fdfd] hover:bg-[#e0f4f4] transition-colors rounded-md shadow-sm"
                >
                  <td className="px-4 py-3">{student.nisn}</td>
                  <td className="px-4 py-3">{student.name}</td>
                  <td className="px-4 py-3">{student.class_name || "-"}</td>
                  <td className="px-4 py-3">{student.academic_level}</td>
                  <td className="px-4 py-3">{student.gender}</td>
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
                    Tidak ada data santri yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <PromoteClassModal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        onConfirm={handlePromoteConfirm}
        className={filterClass}
      />
    </div>
  );
};

export default StudentsPage;
