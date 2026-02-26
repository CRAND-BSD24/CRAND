"use client";

import React, { useEffect, useState, useCallback } from "react";
import { deleteTeacher } from "@/app/admin/teachers/action";
import { searchTeachers, getTeachersFullForExcel, createTeacherFull, bulkDeleteTeachers } from "./action";
import { Search, ChevronLeft, ChevronRight, Eye, Upload, FileSpreadsheet, Trash2, PieChart, BarChart as BarChartIcon, Users, Building } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);
import Link from "next/link";
import { toast } from "sonner";
import ConfirmModal from "@/app/admin/prospective_students/ConfirmModal";
import * as XLSX from "xlsx";
import { useDebounce } from "@/hooks/useDebounce";

interface Teacher {
  _id: string;
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
  nip?: string;
  user_id?: {
    _id: string;
    email: string;
    role: string;
    profile_picture?: string;
  };
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
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; teacherId: string }>({
    isOpen: false,
    teacherId: ""
  });
  const itemsPerPage = 10;

  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [statisticsOpen, setStatisticsOpen] = useState(false);

  const [filters, setFilters] = useState({
    position: "",
    branch: "",
    activeStatus: "",
    employeeStatus: "",
    gender: "",
    education: "",
    department: "",
  });

  const fetchTeachers = useCallback(async () => {
    try {
      const response = await searchTeachers({
        position: filters.position || undefined,
        branch: filters.branch || undefined,
        activeStatus: filters.activeStatus || undefined,
        employeeStatus: filters.employeeStatus || undefined,
        gender: filters.gender || undefined,
        education: filters.education || undefined,
        department: filters.department || undefined,
        query: debouncedSearchQuery || undefined,
      });
      const data = JSON.parse(response);
      setTeachers(data);
      setFilteredTeachers(data);
      setCurrentPage(1); // Reset to first page when data changes
    } catch (error) {
      toast.error("Gagal mengambil data SDM");
    }
  }, [filters, debouncedSearchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelected = [...selectedTeachers];
      currentTeachers.forEach((t) => {
        if (!newSelected.includes(t._id)) {
          newSelected.push(t._id);
        }
      });
      setSelectedTeachers(newSelected);
    } else {
      const idsToRemove = currentTeachers.map((t) => t._id);
      setSelectedTeachers(selectedTeachers.filter((id) => !idsToRemove.includes(id)));
    }
  };

  const handleSelectTeacher = (id: string) => {
    setSelectedTeachers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedTeachers.length === 0) return;
    setConfirmBulkDelete(true);
  };

  const confirmBulkDeleteAction = async () => {
    try {
      await bulkDeleteTeachers(selectedTeachers);
      toast.success(`${selectedTeachers.length} SDM berhasil dihapus`);
      setSelectedTeachers([]);
      setConfirmBulkDelete(false);
      fetchTeachers();
    } catch (error) {
      toast.error("Gagal menghapus data SDM");
    }
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
      toast.success("SDM berhasil dihapus");
      fetchTeachers();
    } catch (error) {
      toast.error("Gagal menghapus SDM");
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

  const handleExportExcel = async () => {
    try {
      const rows: any[] = await getTeachersFullForExcel({
        position: filters.position || undefined,
        branch: filters.branch || undefined,
        activeStatus: filters.activeStatus || undefined,
        employeeStatus: filters.employeeStatus || undefined,
        gender: filters.gender || undefined,
        education: filters.education || undefined,
        department: filters.department || undefined,
        query: searchQuery || undefined,
      });
      if (!rows || rows.length === 0) {
        toast.error("Tidak ada data untuk diekspor");
        return;
      }
      const header = [
        "NIP",
        "Nama",
        "Role",
        "Titel Awal",
        "Titel Akhir",
        "NIK",
        "NPWP",
        "Email",
        "Alamat",
        "Kota/Kabupaten",
        "Tanggal Lahir",
        "No. HP",
        "Jenis Kelamin",
        "Pendidikan Terakhir",
        "Mulai Bekerja",
        "Status SDM",
        "Status Keaktifan",
        "Jabatan",
        "Grade Jabatan",
        "Departemen",
        "Atasan",
        "Bank Rekening",
        "No Rekening",
        "Nama Akun Rekening",
        "Tanggal Pensiun",
        "Tipe Jam Kerja",
        "Shift Kerja",
        "Kantor Cabang",
        "Kantor Utama",
        "Periode Penggajian",
        "Tipe Penggajian",
        "Aktivasi Akun",
        "Catatan",
      ];
      const data = rows.map((t) => [
        t.nip || "",
        t.user_name || "",
        t.role || "",
        t.title_prefix || "",
        t.title_suffix || "",
        t.nik || "",
        t.npwp || "",
        t.email || "",
        t.address || "",
        t.city || "",
        t.birth_date || "",
        t.phone_number || "",
        t.gender || "",
        t.education || "",
        t.start_work_date || "",
        t.status_teacher || "",
        t.active_status || "",
        t.position || "",
        t.grade || "",
        t.department || "",
        t.supervisor_name || "",
        t.bank_name || "",
        t.bank_account_number || "",
        t.bank_account_name || "",
        t.retirement_date || "",
        t.work_type || "",
        t.shift_name || "",
        t.branch_office || "",
        t.head_office || "",
        t.payroll_period || "",
        t.payroll_type || "",
        t.account_activation || "",
        t.notes || "",
      ]);
      const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data SDM");
      XLSX.writeFile(wb, "data-sdm.xlsx");
    } catch {
      toast.error("Gagal mengekspor data");
    }
  };

  const downloadImportTemplate = () => {
    const header = [
      "NIP",
      "Nama",
      "Role",
      "Titel Awal",
      "Titel Akhir",
      "NIK",
      "NPWP",
      "Email",
      "Alamat",
      "Kota/Kabupaten",
      "Tanggal Lahir",
      "No. HP",
      "Jenis Kelamin",
      "Pendidikan Terakhir",
      "Mulai Bekerja",
      "Status SDM",
      "Status Keaktifan",
      "Jabatan",
      "Grade Jabatan",
      "Departemen",
      "Atasan",
      "Bank Rekening",
      "No Rekening",
      "Nama Akun Rekening",
      "Tanggal Pensiun",
      "Tipe Jam Kerja",
      "Shift Kerja",
      "Kantor Cabang",
      "Kantor Utama",
      "Periode Penggajian",
      "Tipe Penggajian",
      "Aktivasi Akun",
      "Catatan",
    ];
    const ws = XLSX.utils.aoa_to_sheet([header]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template SDM");
    XLSX.writeFile(wb, "template-impor-sdm.xlsx");
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }
    const ext = importFile.name.split(".").pop()?.toLowerCase();
    if (!ext || !["xls", "xlsx"].includes(ext)) {
      toast.error("Format file harus .xls atau .xlsx");
      return;
    }
    try {
      const ab = await importFile.arrayBuffer();
      const wb = XLSX.read(ab, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
      const header = (rows[0] || []).map((x) => String(x || "").trim().toLowerCase());
      const findIdx = (name: string) => header.indexOf(name.toLowerCase());
      const idxNip = findIdx("nip");
      const idxName = findIdx("nama");
      const idxRole = findIdx("role");
      const idxTitlePrefix = findIdx("titel awal");
      const idxTitleSuffix = findIdx("titel akhir");
      const idxNik = findIdx("nik");
      const idxNpwp = findIdx("npwp");
      const idxEmail = findIdx("email");
      const idxAddress = findIdx("alamat");
      const idxCity = findIdx("kota/kabupaten");
      const idxBirthDate = findIdx("tanggal lahir");
      const idxPhone = findIdx("no. hp");
      const idxGender = findIdx("jenis kelamin");
      const idxEducation = findIdx("pendidikan terakhir");
      const idxStartWork = findIdx("mulai bekerja");
      const idxStatusTeacher = findIdx("status sdm");
      const idxActiveStatus = findIdx("status keaktifan");
      const idxPosition = findIdx("jabatan");
      const idxGrade = findIdx("grade jabatan");
      const idxDepartment = findIdx("departemen");
      const idxSupervisorName = findIdx("atasan");
      const idxBankName = findIdx("bank rekening");
      const idxBankAccountNumber = findIdx("no rekening");
      const idxBankAccountName = findIdx("nama akun rekening");
      const idxRetirementDate = findIdx("tanggal pensiun");
      const idxWorkType = findIdx("tipe jam kerja");
      const idxShiftName = findIdx("shift kerja");
      const idxBranchOffice = findIdx("kantor cabang");
      const idxHeadOffice = findIdx("kantor utama");
      const idxPayrollPeriod = findIdx("periode penggajian");
      const idxPayrollType = findIdx("tipe penggajian");
      const idxAccountActivation = findIdx("aktivasi akun");
      const idxNotes = findIdx("catatan");
      const getCell = (row: any[], idx: number) => (idx >= 0 ? String(row[idx] ?? "").trim() : "");
      const payload: any[] = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r] || [];
        const nip = getCell(row, idxNip);
        const name = getCell(row, idxName);
        const email = getCell(row, idxEmail);
        const active_status = getCell(row, idxActiveStatus) || "Aktif";
        const position = getCell(row, idxPosition);
        const department = getCell(row, idxDepartment);
        const branch_office = getCell(row, idxBranchOffice);
        if (!nip || !name || !email || !active_status || !position || !department || !branch_office) {
          continue;
        }
        const item = {
          nip,
          name,
          role: getCell(row, idxRole),
          email,
          title_prefix: getCell(row, idxTitlePrefix),
          title_suffix: getCell(row, idxTitleSuffix),
          nik: getCell(row, idxNik),
          npwp: getCell(row, idxNpwp),
          address: getCell(row, idxAddress),
          city: getCell(row, idxCity),
          birth_date: getCell(row, idxBirthDate),
          phone_number: getCell(row, idxPhone),
          gender: getCell(row, idxGender),
          education: getCell(row, idxEducation),
          start_work_date: getCell(row, idxStartWork),
          status_teacher: getCell(row, idxStatusTeacher),
          active_status,
          position,
          grade: getCell(row, idxGrade),
          department,
          supervisor_user_id: undefined,
          bank_name: getCell(row, idxBankName),
          bank_account_number: getCell(row, idxBankAccountNumber),
          bank_account_name: getCell(row, idxBankAccountName),
          retirement_date: getCell(row, idxRetirementDate),
          photo_base64: "",
          kk_file_base64: "",
          identity_file_base64: "",
          work_type: getCell(row, idxWorkType),
          shift_name: getCell(row, idxShiftName),
          branch_office,
          head_office: getCell(row, idxHeadOffice),
          payroll_period: getCell(row, idxPayrollPeriod),
          payroll_type: getCell(row, idxPayrollType),
          account_activation: getCell(row, idxAccountActivation) || "Tidak",
          notes: getCell(row, idxNotes),
        };
        payload.push(item);
      }
      if (payload.length === 0) {
        toast.error("Tidak ada baris valid untuk diimpor");
        return;
      }
      let successCount = 0;
      for (const it of payload) {
        const res = await createTeacherFull(it);
        if (res?.success) successCount += 1;
      }
      toast.success(`Impor berhasil: ${successCount} SDM ditambahkan`);
      setImportOpen(false);
      setImportFile(null);
      fetchTeachers();
    } catch {
      toast.error("Terjadi kesalahan saat impor");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const statusCounts = teachers.reduce((acc, curr) => {
    const status = curr.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const positionCounts = teachers.reduce((acc, curr) => {
    const pos = curr.position || "Unknown";
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: Object.keys(positionCounts),
    datasets: [
      {
        label: 'Jumlah SDM per Jabatan',
        data: Object.values(positionCounts),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 sm:p-8">
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, teacherId: "" })}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus SDM ini?"
        confirmText="Hapus"
        type="danger"
      />
      
      <ConfirmModal
        isOpen={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={confirmBulkDeleteAction}
        title="Konfirmasi Hapus Massal"
        message={`Apakah Anda yakin ingin menghapus ${selectedTeachers.length} data SDM yang dipilih?`}
        confirmText="Hapus Semua"
        type="danger"
      />

      <div className="max-w-7xl mx-auto mt-13">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border-t-4 border-blue-800 transition-all duration-300 hover:shadow-blue-200/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 flex items-center gap-2 sm:gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Manajemen Data SDM
              </h1>
              <p className="text-blue-700 mt-1 pl-8 sm:pl-11 text-sm sm:text-base">Kelola data SDM dengan mudah</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link
                href="/hrd/teachers/create"
                className="bg-blue-800 text-white w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Tambah Data SDM
              </Link>
            </div>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row gap-2 w-full">
            <button
              onClick={handleExportExcel}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg bg-blue-800 text-white text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Ekspor Data
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg bg-blue-800 text-white text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Impor Data
            </button>
            <button
              onClick={() => setStatisticsOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg bg-blue-800 text-white text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <PieChart className="h-4 w-4" />
              Lihat Statistik
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-xs text-blue-800">Jabatan</label>
              <select value={filters.position} onChange={(e) => setFilters({ ...filters, position: e.target.value })} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                {positions.map((p) => (<option key={p}>{p}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-blue-800">Kantor Cabang</label>
              <select value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                {branches.map((b) => (<option key={b}>{b}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-blue-800">Status Keaktifan</label>
              <select value={filters.activeStatus} onChange={(e) => setFilters({ ...filters, activeStatus: e.target.value })} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                <option>Aktif</option>
                <option>Non Aktif</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-blue-800">Status Karyawan</label>
              <select value={filters.employeeStatus} onChange={(e) => setFilters({ ...filters, employeeStatus: e.target.value })} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                <option>SDM</option>
                <option>Pengabdian</option>
                <option>Kontrak</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-blue-800">Jenis Kelamin</label>
              <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-blue-800">Pendidikan</label>
              <select value={filters.education} onChange={(e) => setFilters({ ...filters, education: e.target.value })} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                {educations.map((e) => (<option key={e}>{e}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-blue-800">Departemen</label>
              <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Pilih...</option>
                {departments.map((d) => (<option key={d}>{d}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-blue-800">Cari Data</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 h-4 w-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border-2 border-blue-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Desktop/Tablet: Tabel */}
          <div className="hidden md:block rounded-xl border border-blue-200 shadow-md overflow-x-auto w-full max-w-[85vw] lg:max-w-[calc(100vw-20rem)]">
            {selectedTeachers.length > 0 && (
              <div className="bg-red-50 p-2 flex items-center justify-between border-b border-red-100">
                <span className="text-red-700 text-sm font-medium">{selectedTeachers.length} data terpilih</span>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus Terpilih
                </button>
              </div>
            )}
            <table className="w-full">
              <thead>
                <tr className="bg-blue-800 text-white">
                  <th className="px-2 py-2 text-center font-semibold rounded-tl-lg text-sm w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={handleSelectAll}
                      checked={currentTeachers.length > 0 && currentTeachers.every((t) => selectedTeachers.includes(t._id))}
                    />
                  </th>
                  <th className="px-2 py-2 text-left font-semibold text-sm">NIP</th>
                  <th className="px-2 py-2 text-left font-semibold text-sm">Nama</th>
                  <th className="hidden lg:table-cell px-2 py-2 text-left font-semibold text-sm">Jabatan</th>
                  <th className="hidden xl:table-cell px-2 py-2 text-left font-semibold text-sm">Waktu Bekerja</th>
                  <th className="hidden lg:table-cell px-2 py-2 text-left font-semibold text-sm">No. HP</th>
                  <th className="hidden xl:table-cell px-2 py-2 text-left font-semibold text-sm">Tanggal Lahir</th>
                  <th className="hidden 2xl:table-cell px-2 py-2 text-left font-semibold text-sm">Alamat</th>
                  <th className="px-2 py-2 text-left font-semibold text-sm">Status</th>
                  <th className="hidden 2xl:table-cell px-2 py-2 text-left font-semibold text-sm">Tipe Jam Kerja</th>
                  <th className="hidden 2xl:table-cell px-2 py-2 text-left font-semibold text-sm">Shift</th>
                  <th className="px-2 py-2 text-right font-semibold rounded-tr-lg text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {currentTeachers.map((teacher, index) => (
                  <tr
                    key={teacher._id}
                    className={`border-b hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                    } ${selectedTeachers.includes(teacher._id) ? "bg-blue-100" : ""}`}
                  >
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedTeachers.includes(teacher._id)}
                        onChange={() => handleSelectTeacher(teacher._id)}
                      />
                    </td>
                    <td className="px-2 py-2 text-sm font-medium text-blue-900">{teacher.nip || "-"}</td>
                    <td className="px-2 py-2 text-sm">
                      <div className="font-semibold text-blue-900">{teacher.name}</div>
                      <div className="text-xs text-gray-500">{teacher.email}</div>
                    </td>
                    <td className="hidden lg:table-cell px-2 py-2 text-sm">{teacher.position || '-'}</td>
                    <td className="hidden xl:table-cell px-2 py-2 text-sm">{teacher.work_time || '-'}</td>
                    <td className="hidden lg:table-cell px-2 py-2 text-sm">{teacher.phone_number}</td>
                    <td className="hidden xl:table-cell px-2 py-2 text-sm">{teacher.birth_date || '-'}</td>
                    <td className="hidden 2xl:table-cell px-2 py-2 text-sm">{teacher.address || '-'}</td>
                    <td className="px-2 py-2 text-sm">{teacher.status || '-'}</td>
                    <td className="hidden 2xl:table-cell px-2 py-2 text-sm">{teacher.work_type || '-'}</td>
                    <td className="hidden 2xl:table-cell px-2 py-2 text-sm">{teacher.shift_name || '-'}</td>
                    <td className="px-2 py-2">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/hrd/teachers/${teacher._id}`}
                          className="px-2 py-1 bg-gray-100 text-blue-800 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center gap-1 text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Detail</span>
                        </Link>
                        <Link
                          href={`/hrd/teachers/${teacher._id}/edit`}
                          className="px-2 py-1 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-1 shadow-sm transform hover:scale-[1.02] active:scale-[0.98] text-sm"
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
                      colSpan={11}
                      className="px-4 py-6 text-center text-blue-800 bg-blue-50/70 italic"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="font-medium text-sm">
                          {searchQuery
                            ? "Tidak ada hasil pencarian"
                            : "Tidak ada data SDM yang tersedia"}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile: kartu */}
          <div className="md:hidden space-y-3">
            {currentTeachers.map((teacher) => (
              <div
                key={teacher._id}
                className="rounded-xl border border-blue-100 bg-white shadow-sm p-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      {teacher.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      NIP: {teacher.nip || "-"}
                    </p>
                    {teacher.position && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        {teacher.position}
                      </p>
                    )}
                    {teacher.work_time && (
                      <p className="text-[11px] text-slate-500">
                        Jam kerja: {teacher.work_time}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      {teacher.address || "-"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500">
                      {teacher.phone_number}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {teacher.birth_date || "-"}
                    </p>
                    <span className="mt-2 inline-flex px-2 py-1 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                      {teacher.status || "Status tidak diketahui"}
                    </span>
                    {teacher.work_type && (
                      <p className="mt-1 text-[11px] text-slate-500">
                        {teacher.work_type}
                        {teacher.shift_name ? ` • ${teacher.shift_name}` : ""}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-blue-50 mt-1">
                  <Link
                    href={`/hrd/teachers/${teacher._id}`}
                    className="px-3 py-1.5 bg-gray-100 text-blue-800 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center gap-1 text-xs"
                  >
                    <Eye className="h-3 w-3" />
                    Detail
                  </Link>
                  <Link
                    href={`/hrd/teachers/${teacher._id}/edit`}
                    className="px-3 py-1.5 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-1 text-xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(teacher._id)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-1 text-xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Hapus
                  </button>
                </div>
              </div>
            ))}
            {currentTeachers.length === 0 && (
              <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/60 py-10 px-4 text-center text-slate-500 text-sm">
                {searchQuery
                  ? "Tidak ada hasil pencarian"
                  : "Tidak ada data SDM yang tersedia"}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 sm:mt-8 gap-4">
              <div className="text-xs sm:text-sm bg-blue-50 text-blue-800 px-3 sm:px-4 py-2 rounded-lg border border-blue-200">
                Menampilkan <span className="font-bold">{startIndex + 1}</span> - <span className="font-bold">{Math.min(endIndex, filteredTeachers.length)}</span> dari <span className="font-bold">{filteredTeachers.length}</span> data
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg flex items-center gap-1 transition-all duration-200 ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-800 text-white shadow-md hover:shadow-lg hover:bg-blue-700 transform hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                
                <div className="flex gap-1 overflow-x-auto pb-1 max-w-[200px] sm:max-w-none no-scrollbar">
                  {(() => {
                     // Simple responsive pagination logic
                     let pages = [];
                     const maxVisible = 3; // Mobile
                     const maxVisibleDesktop = 5; // Desktop
                     
                     // Use CSS to hide/show based on screen size? No, difficult with map.
                     // Just render all for now but use scroll for mobile or limited logic?
                     // Let's implement a sliding window logic that works for both but is compact
                     
                     let start = Math.max(1, currentPage - 2);
                     let end = Math.min(totalPages, start + 4);
                     
                     if (end - start < 4) {
                       start = Math.max(1, end - 4);
                     }
                     
                     for (let i = start; i <= end; i++) {
                       pages.push(i);
                     }
                     
                     return pages.map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-200 text-sm sm:text-base ${
                          currentPage === page
                            ? "bg-blue-800 text-white font-bold shadow-md"
                            : "bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-800"
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg flex items-center gap-1 transition-all duration-200 ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-800 text-white shadow-md hover:shadow-lg hover:bg-blue-700 transform hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {importOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-800">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-800">Impor Data SDM</h2>
              <p className="text-blue-700 mt-3 text-sm">
                Impor data SDM dari file Excel dengan format .xls atau .xlsx. Gunakan template agar kolom sesuai dengan form.
              </p>
              <div className="mt-4 border-2 border-blue-300 rounded-xl px-3 py-3 bg-white">
                <input
                  className="w-full"
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={downloadImportTemplate}
                  className="px-4 py-2 rounded-xl bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-2 text-sm"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Download Template
                </button>
                <button
                  onClick={handleImport}
                  className="px-4 py-2 rounded-xl bg-blue-800 text-white text-sm"
                >
                  Import Data
                </button>
                <button
                  onClick={() => setImportOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-blue-900 text-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        <Dialog open={statisticsOpen} onOpenChange={setStatisticsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Statistik SDM</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4">Status Kepegawaian</h3>
                <div className="w-full max-w-xs">
                  <Pie data={pieData} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4">Distribusi Jabatan</h3>
                <div className="w-full">
                  <Bar 
                    data={barData} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-blue-50 p-4 rounded-xl text-center">
                 <p className="text-sm text-blue-600">Total SDM</p>
                 <p className="text-2xl font-bold text-blue-800">{teachers.length}</p>
               </div>
               <div className="bg-green-50 p-4 rounded-xl text-center">
                 <p className="text-sm text-green-600">Aktif</p>
                 <p className="text-2xl font-bold text-green-800">
                   {teachers.filter(t => t.status === 'Aktif' || t.status === 'Active').length}
                 </p>
               </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      
    </div>
  );
};

export default TeachersPage;
const positions = [
  "Pimpinan","Penasihat","Direktur Operasional","Direktur Pendidikan","Manajer Kepengasuhan","Manajer Tahfizh","Manajer Keuangan & Bisnis","Manajer Sekolah Menengah & Litbang","Manajer Sekolah Dasar","Manajer Sekretariat","Manajer Aset, Kerumahtanggaan & Infrastruktur","SPV Kedisiplinan, Kerapihan & Kesehatan","SPV Akhlak & Ibadah","SPV Tahfizh","SPV Kurikulum & Kedisiplinan","SPV Bahasa & Pengajaran","SPV BASAM","SPV CRM","SPV Media","SPV Keuangan","SPV PISMART","SPV Laundry","SPV Aset & Infrastruktur","SPV Kerumahtanggaan","Staff Tahfizh","Staff Kepengasuhan","Staff Bahasa & Pengajaran","Security","Office Boy","Staff HRD","Staff Dapur","Staff PISMART","Staff Keuangan"
];
const departments = [
  "Direksi","Departemen Kepengasuhan","Departemen Tahfizh","Departemen Keuangan & Bisnis","Departemen Sekolah Menengah & Litbang","Departemen Sekolah Dasar","Departemen Sekretariat","Departemen Aset, Kerumahtanggaan & Infrastruktur"
];
const branches = [
  "Pesantren Ibnu Syam 1","Pesantren Ibnu Syam 2 Putra","Pesantren Ibnu Syam 2 Putri","Pesantren Ibnu Syam 5"
];
const educations = ["SD","SMP","SMA","D1","D2","D3","S1","S2","S3","Paket C"];
