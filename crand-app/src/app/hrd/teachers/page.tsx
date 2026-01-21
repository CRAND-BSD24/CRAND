"use client";

import React, { useEffect, useState } from "react";
import { deleteTeacher } from "@/app/admin/teachers/action";
import { searchTeachers } from "./action";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ConfirmModal from "@/app/admin/prospective_students/ConfirmModal";

interface Teacher {
  _id: string;
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
  nip?: string;
  user_id?: string;
  position?: string;
  work_time?: string;
  birth_date?: string;
  status?: string;
  work_type?: "Reguler" | "Shift" | string;
  shift_name?: "Reguler" | "Custom" | "Shift 1" | "Shift 2" | "Shift 3" | string;
}

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; teacherId: string }>({
    isOpen: false,
    teacherId: ""
  });
  const itemsPerPage = 5;

  const [filters, setFilters] = useState({
    position: "",
    branch: "",
    activeStatus: "",
    employeeStatus: "",
    gender: "",
    education: "",
    department: "",
  });

  const fetchTeachers = async () => {
    try {
      const response = await searchTeachers({
        position: filters.position || undefined,
        branch: filters.branch || undefined,
        activeStatus: filters.activeStatus || undefined,
        employeeStatus: filters.employeeStatus || undefined,
        gender: filters.gender || undefined,
        education: filters.education || undefined,
        department: filters.department || undefined,
        query: searchQuery || undefined,
      });
      const data = JSON.parse(response);
      setTeachers(data);
      setFilteredTeachers(data);
      setCurrentPage(1); // Reset to first page when data changes
    } catch (error) {
      toast.error("Gagal mengambil data ustadz");
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await fetchTeachers();
  };

  const handleDelete = async (id: string) => {
    setConfirmDelete({
      isOpen: true,
      teacherId: id
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTeacher(confirmDelete.teacherId);
      toast.success("Ustadz berhasil dihapus");
      fetchTeachers();
    } catch (error) {
      toast.error("Gagal menghapus ustadz");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.position, filters.branch, filters.activeStatus, filters.employeeStatus, filters.gender, filters.education, filters.department]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-8">
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, teacherId: "" })}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus ustadz ini?"
        confirmText="Hapus"
        type="danger"
      />

      <div className="max-w-7xl mx-auto mt-13">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border-t-4 border-emerald-800 transition-all duration-300 hover:shadow-emerald-200/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 flex items-center gap-2 sm:gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Manajemen Data Ustadz
              </h1>
              <p className="text-emerald-700 mt-1 pl-8 sm:pl-11 text-sm sm:text-base">Kelola data ustadz dengan mudah</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/hrd/teachers/create"
                className="bg-emerald-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-emerald-700 transition-all duration-300 flex items-center gap-2 shadow-md transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Tambah Ustadz
              </Link>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <button className="px-4 py-2 rounded-lg bg-emerald-800 text-white">Ekspor Data</button>
            <button className="px-4 py-2 rounded-lg bg-emerald-800 text-white">Impor Data</button>
            <button className="px-4 py-2 rounded-lg bg-emerald-800 text-white">Lihat Statistik</button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-xs text-emerald-800">Jabatan</label>
              <select value={filters.position} onChange={(e) => setFilters({ ...filters, position: e.target.value })} className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                {positions.map((p) => (<option key={p}>{p}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-emerald-800">Kantor Cabang</label>
              <select value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })} className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                {branches.map((b) => (<option key={b}>{b}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-emerald-800">Status Keaktifan</label>
              <select value={filters.activeStatus} onChange={(e) => setFilters({ ...filters, activeStatus: e.target.value })} className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                <option>Aktif</option>
                <option>Non Aktif</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-emerald-800">Status Karyawan</label>
              <select value={filters.employeeStatus} onChange={(e) => setFilters({ ...filters, employeeStatus: e.target.value })} className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                <option>SDM</option>
                <option>Pengabdian</option>
                <option>Kontrak</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-emerald-800">Jenis Kelamin</label>
              <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })} className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-emerald-800">Pendidikan</label>
              <select value={filters.education} onChange={(e) => setFilters({ ...filters, education: e.target.value })} className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                {educations.map((e) => (<option key={e}>{e}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-emerald-800">Departemen</label>
              <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                {departments.map((d) => (<option key={d}>{d}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-emerald-800">Cari Data</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 h-4 w-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border-2 border-emerald-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-emerald-200 shadow-md">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-800 text-white">
                  <th className="px-2 py-2 text-left font-semibold rounded-tl-lg text-sm">NIP</th>
                  <th className="px-2 py-2 text-left font-semibold text-sm">Nama</th>
                  <th className="hidden sm:table-cell px-2 py-2 text-left font-semibold text-sm">Jabatan</th>
                  <th className="px-2 py-2 text-left font-semibold text-sm">Waktu Bekerja</th>
                  <th className="px-2 py-2 text-left font-semibold text-sm">No. HP</th>
                  <th className="px-2 py-2 text-left font-semibold text-sm">Tanggal Lahir</th>
                  <th className="hidden sm:table-cell px-2 py-2 text-left font-semibold text-sm">Alamat</th>
                  <th className="px-2 py-2 text-left font-semibold text-sm">Status</th>
                  <th className="hidden sm:table-cell px-2 py-2 text-left font-semibold text-sm">Tipe Jam Kerja</th>
                  <th className="hidden sm:table-cell px-2 py-2 text-left font-semibold text-sm">Shift</th>
                  <th className="px-2 py-2 text-right font-semibold rounded-tr-lg text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {currentTeachers.map((teacher, index) => (
                  <tr
                    key={teacher._id}
                    className="hover:bg-emerald-50/50 transition-colors"
                  >
                    <td className="px-2 py-2 text-sm">{teacher.nip || '-'}</td>
                    <td className="px-2 py-2 font-medium text-emerald-800 text-sm">
                      <div>
                        {teacher.name}
                        <div className="sm:hidden text-xs text-gray-500 mt-0.5">
                          {teacher.phone_number}
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-2 py-2 text-sm">{teacher.position || '-'}</td>
                    <td className="px-2 py-2 text-sm">{teacher.work_time || '-'}</td>
                    <td className="px-2 py-2 text-sm">{teacher.phone_number}</td>
                    <td className="px-2 py-2 text-sm">{teacher.birth_date || '-'}</td>
                    <td className="hidden sm:table-cell px-2 py-2 text-sm">{teacher.address || '-'}</td>
                    <td className="px-2 py-2 text-sm">{teacher.status || '-'}</td>
                    <td className="hidden sm:table-cell px-2 py-2 text-sm">{teacher.work_type || '-'}</td>
                    <td className="hidden sm:table-cell px-2 py-2 text-sm">{teacher.shift_name || '-'}</td>
                    <td className="px-2 py-2">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/hrd/teachers/${teacher._id}`}
                          className="px-2 py-1 bg-gray-100 text-emerald-800 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center gap-1 text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Detail</span>
                        </Link>
                        <Link
                          href={`/hrd/teachers/${teacher._id}/edit`}
                          className="px-2 py-1 bg-emerald-800 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 flex items-center gap-1 shadow-sm transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span className="hidden sm:inline">Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(teacher._id)}
                          className="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-1 shadow-sm transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentTeachers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-emerald-800 bg-emerald-50/70 italic"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-medium text-sm">
                          {searchQuery
                            ? "Tidak ada hasil pencarian"
                            : "Tidak ada data ustadz yang tersedia"}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 sm:mt-8 gap-4">
              <div className="text-xs sm:text-sm bg-emerald-50 text-emerald-800 px-3 sm:px-4 py-2 rounded-lg border border-emerald-200">
                Menampilkan <span className="font-bold">{startIndex + 1}</span> - <span className="font-bold">{Math.min(endIndex, filteredTeachers.length)}</span> dari <span className="font-bold">{filteredTeachers.length}</span> data
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg flex items-center gap-1 transition-all duration-200 ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-emerald-800 text-white shadow-md hover:shadow-lg hover:bg-emerald-700 transform hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-200 text-sm sm:text-base ${
                        currentPage === page
                          ? "bg-emerald-800 text-white font-bold shadow-md"
                          : "bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg flex items-center gap-1 transition-all duration-200 ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-emerald-800 text-white shadow-md hover:shadow-lg hover:bg-emerald-700 transform hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
};

export default TeachersPage;
const positions = [
  "Pimpinan","Penasihat","Direktur Operasional","Direktur Pendidikan","Manajer Kepengasuhan","Manajer Tahfizh","Manajer Keuangan & Bisnis","Manajer Sekolah Menengah & Litbang","Manajer Sekolah Dasar","Manajer Sekretariat","Manajer Aset, Kerumahtanggaan & Infrastruktur","SPV Kedisiplinan, Kerapihan & Kesehatan","SPV Akhlak & Ibadah","SPV Tahfizh","SPV Kurikulum & Kedisiplinan","SPV Bahasa & Pengajaran","SPV BASAM","SPV CRM","SPV Media","SPV Keuangan","SPV PISMART","SPV Laundry","SPV Aset & Infrastruktur","SPV Kerumahtanggaan","Staff Tahfizh","Staff Kepengasuhan","Staff Bahasa & Pengajaran","Security","Office Boy","Staff HRD","Staff Dapur","Staff PISMART","Staff Keuangan"
];
const departments = [
  "Departemen Kepengasuhan","Departemen Tahfizh","Departemen Keuangan & Bisnis","Departemen Sekolah Menengah & Litbang","Departemen Sekolah Dasar","Departemen Sekretariat","Departemen Aset, Kerumahtanggaan & Infrastruktur"
];
const branches = [
  "Pesantren Ibnu Syam 1","Pesantren Ibnu Syam 2 Putra","Pesantren Ibnu Syam 2 Putri","Pesantren Ibnu Syam 5"
];
const educations = ["SD","SMP","SMA","D1","D2","D3","S1","S2","S3","Paket C"];