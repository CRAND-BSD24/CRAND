"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getAllStudents, promoteStudentsByClassId } from "./action";
import Link from "next/link";
import AddStudentModal from "./AddStudentModal";
import PromoteClassModal from "./PromoteClassModal";
import { toast } from "sonner";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";

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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

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

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  return (
    <div className="p-4 sm:p-8 pt-20 lg:pt-8 bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-8 mb-8 relative z-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-6 sm:mb-8 text-center">
          Manajemen Data Santri
        </h1>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-emerald-800">
            Daftar Santri
          </h2>
          <AddStudentModal onStudentAdded={fetchStudents} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 relative z-0">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
              <input
                type="text"
                placeholder="Cari nama santri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 border-2 border-emerald-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative flex-grow">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full pl-10 border-2 border-emerald-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all appearance-none"
              >
                <option value="">Pilih Kelas</option>
                {uniqueClasses.map((kelas, index) => (
                  <option key={`${kelas}-${index}`} value={kelas}>
                    {kelas}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400 pointer-events-none" size={20} />
            </div>
          </div>
          <button
            onClick={handlePromoteByClass}
            disabled={!filterClass}
            className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Naikkan Semua di Kelas Ini
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2 mb-6">
            <thead>
              <tr className="bg-emerald-800 text-white rounded-lg overflow-hidden">
                <th className="px-4 py-3 cursor-pointer hidden sm:table-cell rounded-l-lg">
                  NISN{getSortIndicator("nisn")}
                </th>
                <th className="px-4 py-3 cursor-pointer">
                  Nama{getSortIndicator("name")}
                </th>
                <th className="px-4 py-3 cursor-pointer hidden sm:table-cell">
                  Kelas{getSortIndicator("class_name")}
                </th>
                <th className="px-4 py-3 cursor-pointer hidden md:table-cell">
                  Jenjang{getSortIndicator("academic_level")}
                </th>
                <th className="px-4 py-3 cursor-pointer hidden md:table-cell">
                  JK{getSortIndicator("gender")}
                </th>
                <th className="px-4 py-3 rounded-r-lg">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((student) => (
                <tr
                  key={student._id}
                  className="bg-white hover:bg-emerald-50 transition-colors rounded-lg shadow-sm"
                >
                  <td className="px-4 py-3 hidden sm:table-cell rounded-l-lg">{student.nisn}</td>
                  <td className="px-4 py-3">{student.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{student.class_name || "-"}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{student.academic_level}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{student.gender}</td>
                  <td className="px-4 py-3 rounded-r-lg">
                    <Link
                      href={`/admin/students/${student._id}`}
                      className="text-emerald-800 font-semibold hover:underline transition-all"
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
                    className="text-center py-6 text-emerald-800 italic bg-emerald-50 rounded-lg"
                  >
                    Tidak ada data santri yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div className="text-sm text-gray-600">
              Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredStudents.length)} dari {filteredStudents.length} data
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 transition-colors"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPromoteModalOpen && (
        <PromoteClassModal
          isOpen={isPromoteModalOpen}
          onClose={() => setIsPromoteModalOpen(false)}
          onConfirm={handlePromoteConfirm}
          className={filterClass}
        />
      )}
    </div>
  );
};

export default StudentsPage;
