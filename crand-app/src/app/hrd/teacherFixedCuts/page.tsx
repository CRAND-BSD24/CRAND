"use client";

import { useEffect, useMemo, useState } from "react";
import { getFilterOptions, searchTeacherFixedCuts, searchTeacherFixedCutsAll, bulkUpdateTeacherFixedCutsByNip } from "./action";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Search, Upload, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

interface RowItem {
  _id?: string;
  nip: string;
  name: string;
  position: string;
  branch_office: string;
  department: string;
}

export default function TeacherFixedCutsPage() {
  const [filters, setFilters] = useState({ branch: "", department: "", payroll_period: "" });
  const [options, setOptions] = useState<{ branches: string[]; departments: string[]; payrollPeriods: string[] }>({ branches: [], departments: [], payrollPeriods: [] });
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [items, setItems] = useState<RowItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addNip, setAddNip] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [pendingAdds, setPendingAdds] = useState<{ nip: string; amount: number }[]>([]);

  useEffect(() => {
    (async () => {
      const o = await getFilterOptions();
      setOptions(o);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await searchTeacherFixedCuts({ branch: filters.branch || undefined, department: filters.department || undefined, payroll_period: filters.payroll_period || undefined, query }, page, pageSize);
      setItems(res.items);
      setTotalCount(res.totalCount);
    })();
  }, [filters.branch, filters.department, filters.payroll_period, query, page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount]);

  const addPending = () => {
    const nip = addNip.trim();
    const amount = Number((addAmount || "").replace(/\D/g, "")) || 0;
    if (!nip) {
      toast.error("NIP wajib diisi");
      return;
    }
    setPendingAdds((prev) => [...prev, { nip, amount }]);
    setAddNip("");
    setAddAmount("");
    setAddModalOpen(false);
    setAdding(true);
  };

  const handleSave = async () => {
    const payload = pendingAdds.filter((r) => r.nip.trim().length > 0 && Number.isFinite(r.amount));
    if (payload.length === 0) {
      toast.error("Tidak ada perubahan untuk disimpan");
      return;
    }
    const res = await bulkUpdateTeacherFixedCutsByNip(payload);
    if (res.success) {
      toast.success(`Tersimpan ${res.updated} data potongan tetap`);
      setAdding(false);
      setPendingAdds([]);
      const refreshed = await searchTeacherFixedCuts({ branch: filters.branch || undefined, department: filters.department || undefined, payroll_period: filters.payroll_period || undefined, query }, page, pageSize);
      setItems(refreshed.items);
      setTotalCount(refreshed.totalCount);
    } else {
      toast.error(res.message || "Gagal menyimpan");
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }
    try {
      const ab = await importFile.arrayBuffer();
      const wb = XLSX.read(ab, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
      const header = (rows[0] || []).map((x) => String(x || "").trim().toLowerCase());
      const findIdx = (cands: string[]) => header.findIndex((h) => cands.includes(h));
      const idxNip = findIdx(["nip", "n i p", "id pegawai"]);
      const idxAmount = findIdx(["potongan", "amount", "nilai potongan"]);
      const ni = idxNip >= 0 ? idxNip : 0;
      const ai = idxAmount >= 0 ? idxAmount : 1;
      const payload: { nip: string; amount: number }[] = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r] || [];
        const nip = String(row[ni] ?? "").trim();
        const amount = Number(String(row[ai] ?? "").replace(/\D/g, "")) || 0;
        if (!nip) continue;
        payload.push({ nip, amount });
      }
      if (payload.length === 0) {
        toast.error("Tidak ada baris valid untuk diimpor");
        return;
      }
      const res = await bulkUpdateTeacherFixedCutsByNip(payload);
      if (res.success) {
        toast.success(`Impor berhasil: ${res.updated} potongan diperbarui`);
        setImportOpen(false);
        setImportFile(null);
        const refreshed = await searchTeacherFixedCuts({ branch: filters.branch || undefined, department: filters.department || undefined, payroll_period: filters.payroll_period || undefined, query }, page, pageSize);
        setItems(refreshed.items);
        setTotalCount(refreshed.totalCount);
      } else {
        toast.error(res.message || "Gagal impor");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan saat memproses file");
    }
  };

  const exportToExcel = async () => {
    const all = await searchTeacherFixedCutsAll({ branch: filters.branch || undefined, department: filters.department || undefined, payroll_period: filters.payroll_period || undefined, query });
    const header = ["NIP", "Nama", "Jabatan", "Kantor Cabang", "Departemen"];
    const rows = all.map((it) => [it.nip, it.name, it.position, it.branch_office, it.department]);
    const data = [header, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PotonganTetapUstadz");
    XLSX.writeFile(wb, "potongan-tetap-ustadz.xlsx");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 to-teal-50 px-0 sm:px-8 py-3 sm:py-8">
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-t-4 border-blue-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">Potongan Tetap Ustadz</h1>
              <p className="text-blue-700 mt-1 text-sm">Kelola potongan tetap per ustadz</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setImportOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-800 text-white flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Upload className="w-4 h-4" />
                Import Data
              </button>
              <Link
                href="/hrd/fixedCuts"
                className="px-4 py-2 rounded-xl bg-blue-800 text-white text-center w-full sm:w-auto"
              >
                Tambah Data
              </Link>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-blue-800 text-white w-full sm:w-auto"
              >
                Simpan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6">
            <div>
              <label className="text-xs text-blue-800">Kantor Cabang</label>
              <select value={filters.branch} onChange={(e) => { setFilters((f) => ({ ...f, branch: e.target.value })); setPage(1); }} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Semua</option>
                {options.branches.map((b) => (<option key={b} value={b}>{b}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-blue-800">Periode Penggajian</label>
              <select value={filters.payroll_period} onChange={(e) => { setFilters((f) => ({ ...f, payroll_period: e.target.value })); setPage(1); }} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Semua</option>
                {options.payrollPeriods.map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-blue-800">Departemen</label>
              <select value={filters.department} onChange={(e) => { setFilters((f) => ({ ...f, department: e.target.value })); setPage(1); }} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 text-sm">
                <option value="">Semua</option>
                {options.departments.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-blue-800">Cari Data</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 h-4 w-4" />
                <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="w-full pl-9 pr-3 py-2 border-2 border-blue-300 rounded-xl text-sm" />
              </div>
            </div>
          </div>

          {/* Desktop: tabel */}
          <div className="hidden md:block rounded-xl border border-blue-100 mt-6">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-800 text-white">
                    <th className="px-3 py-2 text-left font-semibold rounded-tl-lg">NIP</th>
                    <th className="px-3 py-2 text-left font-semibold">Nama</th>
                    <th className="px-3 py-2 text-left font-semibold">Jabatan</th>
                    <th className="px-3 py-2 text-left font-semibold">Kantor Cabang</th>
                    <th className="px-3 py-2 text-left font-semibold rounded-tr-lg">Departemen</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it._id || it.nip} className="odd:bg-white even:bg-blue-50/50">
                      <td className="px-3 py-2">{it.nip}</td>
                      <td className="px-3 py-2">{it.name}</td>
                      <td className="px-3 py-2">{it.position}</td>
                      <td className="px-3 py-2">{it.branch_office}</td>
                      <td className="px-3 py-2">{it.department}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-blue-800 bg-blue-50/70 italic">Tidak ada data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: kartu */}
          <div className="md:hidden mt-6 space-y-3">
            {items.map((it) => (
              <div
                key={it._id || it.nip}
                className="rounded-xl border border-blue-100 bg-white shadow-sm p-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-blue-800">{it.name}</p>
                    <p className="text-[11px] text-slate-500">NIP: {it.nip}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500">{it.position}</p>
                    <p className="text-[11px] text-slate-500">{it.branch_office}</p>
                    <p className="text-[11px] text-slate-500">{it.department}</p>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="px-4 py-6 text-center text-blue-800 bg-blue-50/70 rounded-xl italic">
                Tidak ada data
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 bg-blue-800 text-white rounded-xl disabled:bg-gray-200 disabled:text-gray-400"
              >
                Prev
              </button>
              <span className="text-blue-800 text-sm">Hal {page} dari {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-2 bg-blue-800 text-white rounded-xl disabled:bg-gray-200 disabled:text-gray-400"
              >
                Next
              </button>
            </div>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 rounded-xl bg-blue-800 text-white flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export to Excel
            </button>
          </div>

          {importOpen && (
            <div className="mt-6 p-4 border rounded-xl bg-blue-50/70">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  className="w-full text-xs"
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
                <button
                  onClick={handleImport}
                  className="px-4 py-2 rounded-xl bg-blue-800 text-white w-full sm:w-auto"
                >
                  Proses Import
                </button>
                <button
                  onClick={() => { setImportOpen(false); setImportFile(null); }}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-blue-800 w-full sm:w-auto"
                >
                  Tutup
                </button>
              </div>
              <p className="text-xs text-blue-700 mt-2">Format kolom: NIP, Potongan</p>
            </div>
          )}

          {/* Form tambah manual dihilangkan karena diarahkan ke master /hrd/fixedCuts */}
        </div>
      </div>
    </div>
  );
}
