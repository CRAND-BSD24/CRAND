"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getAllStudents, promoteStudentsByClassId } from "./action";
import Link from "next/link";
import AddStudentModal from "./AddStudentModal";

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

type SortField = 'name' | 'class_name' | 'academic_level' | 'gender' | 'nisn';
type SortOrder = 'asc' | 'desc';

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filterClass, setFilterClass] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>('nisn');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchStudents = useCallback(async (field: SortField = sortField, order: SortOrder = sortOrder) => {
    try {
      const response = await getAllStudents(undefined, field, order);
      const data = JSON.parse(response);
      setStudents(data);
    } catch (error) {
      console.error("Gagal mengambil data santri:", error);
    }
  }, [sortField, sortOrder]);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      const data = await response.json();
      console.log("Classes fetched:", data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    fetchStudents(sortField, sortOrder);
  }, [sortField, sortOrder, fetchStudents]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const handlePromoteByClass = async () => {
    if (!filterClass) return alert("Pilih kelas terlebih dahulu ya");

    const confirmed = confirm(`Yakin ingin menaikkan semua santri di kelas ${filterClass}?`);
    if (!confirmed) return;

    const success = await promoteStudentsByClassId(filterClass);
    if (success) {
      alert(`Santri di kelas ${filterClass} berhasil dinaikkan ke tingkat selanjutnya!`);
      fetchStudents();
      setFilterClass("");
    } else {
      alert("Gagal menaikkan kelas santri.");
    }
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
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField === field) {
      return sortOrder === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  return (
    <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mt-12">
        <h1 className="text-3xl font-bold text-emerald-800 mb-8 text-center">
          Manajemen Data Santri
        </h1>

        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-emerald-800">
            Daftar Santri
          </h2>
          <AddStudentModal onStudentAdded={fetchStudents} />
        </div>

        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="border-2 border-emerald-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all"
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
            className="border-2 border-emerald-300 p-2 rounded-lg flex-grow max-w-md focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all"
          />

          <button
            onClick={handlePromoteByClass}
            disabled={!filterClass}
            className="bg-emerald-800 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Naikkan Semua di Kelas Ini
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2 mb-6">
            <thead>
              <tr className="bg-emerald-800 text-white">
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('nisn')}>
                  NISN{getSortIndicator('nisn')}
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                  Nama{getSortIndicator('name')}
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('class_name')}>
                  Kelas{getSortIndicator('class_name')}
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('academic_level')}>
                  Jenjang Akademik{getSortIndicator('academic_level')}
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('gender')}>
                  Jenis Kelamin{getSortIndicator('gender')}
                </th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((student) => (
                <tr
                  key={student._id}
                  className="bg-white hover:bg-emerald-50 transition-colors rounded-md shadow-sm"
                >
                  <td className="px-4 py-3">{student.nisn}</td>
                  <td className="px-4 py-3">{student.name}</td>
                  <td className="px-4 py-3">{student.class_name || "-"}</td>
                  <td className="px-4 py-3">{student.academic_level}</td>
                  <td className="px-4 py-3">{student.gender}</td>
                  <td className="px-4 py-3">
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
                    className="text-center py-6 text-emerald-800 italic bg-emerald-50 rounded-md"
                  >
                    Tidak ada data santri yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 pb-4">
            <div className="text-sm text-gray-600">
              Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredStudents.length)} dari {filteredStudents.length} data
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-emerald-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-all duration-200"
              >
                Previous
              </button>
              <div className="flex items-center gap-2 px-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg ${currentPage === page
                      ? 'bg-emerald-800 text-white'
                      : 'bg-gray-100 hover:bg-emerald-100 text-gray-700'
                      } transition-all duration-200`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-emerald-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;
