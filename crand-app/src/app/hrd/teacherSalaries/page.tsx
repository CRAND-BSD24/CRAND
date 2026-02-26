"use client";

import { useEffect, useMemo, useState } from "react";
import { getFilterOptions, searchTeacherSalaries, searchTeacherSalariesAll, bulkUpdateTeacherBaseSalaryByNip, bulkUpdateTeacherPositionByNip } from "./action";
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
  base_salary: number;
  payroll_type?: string;
  isNew?: boolean;
}

export default function TeacherSalariesPage() {
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
      const res = await searchTeacherSalaries({ branch: filters.branch || undefined, department: filters.department || undefined, payroll_period: filters.payroll_period || undefined, query }, page, pageSize);
      setItems(res.items);
      setTotalCount(res.totalCount);
    })();
  }, [filters.branch, filters.department, filters.payroll_period, query, page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount]);

  const addNewRow = () => {};

  const handleSave = async () => {
    const payload = pendingAdds.filter((r) => r.nip.trim().length > 0 && Number.isFinite(r.amount));
    if (payload.length === 0) {
      toast.error("Tidak ada perubahan untuk disimpan");
      return;
    }
    const res = await bulkUpdateTeacherBaseSalaryByNip(payload);
    if (res.success) {
      toast.success(`Tersimpan ${res.updated} data gaji pokok`);
      setAdding(false);
      setPendingAdds([]);
      const refreshed = await searchTeacherSalaries({ branch: filters.branch || undefined, department: filters.department || undefined, payroll_period: filters.payroll_period || undefined, query }, page, pageSize);
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
      const idxName = findIdx(["nama", "name"]);
      const idxPosition = findIdx(["jabatan", "position"]);
      const ni = idxNip >= 0 ? idxNip : 0;
      const nm = idxName >= 0 ? idxName : -1;
      const pi = idxPosition >= 0 ? idxPosition : 1;
      const payload: { nip: string; name?: string; position: string }[] = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r] || [];
        const nip = String(row[ni] ?? "").trim();
        const name = nm >= 0 ? String(row[nm] ?? "").trim() : undefined;
        const position = String(row[pi] ?? "").trim();
        if (!nip || !position) continue;
        payload.push({ nip, name, position });
      }
      if (payload.length === 0) {
        toast.error("Tidak ada baris valid untuk diimpor");
        return;
      }
      const res = await bulkUpdateTeacherPositionByNip(payload);
      if (res.success) {
        toast.success(`Impor berhasil: ${res.updated} posisi diperbarui`);
        setImportOpen(false);
        setImportFile(null);
        const refreshed = await searchTeacherSalaries({ branch: filters.branch || undefined, department: filters.department || undefined, payroll_period: filters.payroll_period || undefined, query }, page, pageSize);
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
    const all = await searchTeacherSalariesAll({ branch: filters.branch || undefined, department: filters.department || undefined, payroll_period: filters.payroll_period || undefined, query });
    const header = ["NIP", "Nama", "Jabatan", "Kantor Cabang", "Departemen", "Gaji Pokok"];
    const rows = all.map((it) => [it.nip, it.name, it.position, it.branch_office, it.department, it.base_salary]);
    const data = [header, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GajiUstadz");
    XLSX.writeFile(wb, "gaji-ustadz.xlsx");
  };

  const downloadImportTemplate = () => {
    const header = ["NIP", "Nama", "Jabatan"];
    const ws = XLSX.utils.aoa_to_sheet([header]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "format-impor-gaji-ustadz.xlsx");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 to-teal-50 px-0 sm:px-8 py-3 sm:py-8">
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-t-4 border-blue-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">Gaji & Tunjangan Tetap Ustadz</h1>
              <p className="text-blue-700 mt-1 text-sm">Kelola gaji pokok per ustadz</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setImportOpen(true)} className="px-4 py-2 rounded-xl bg-blue-800 text-white flex items-center gap-2"><Upload className="w-4 h-4" />Import Data</button>
              <Link href="/hrd/fixedAllowances" className="px-4 py-2 rounded-xl bg-blue-800 text-white">Tambah Data</Link>
              <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-blue-800 text-white">Simpan</button>
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
                    <th className="px-3 py-2 text-left font-semibold">Departemen</th>
                    <th className="px-3 py-2 text-right font-semibold rounded-tr-lg">Gaji Pokok</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={`${it._id || it.nip}-${idx}`} className="odd:bg-white even:bg-blue-50/50">
                      <td className="px-3 py-2">{it.nip}</td>
                      <td className="px-3 py-2">{it.name}</td>
                      <td className="px-3 py-2">{it.position}</td>
                      <td className="px-3 py-2">{it.branch_office}</td>
                      <td className="px-3 py-2">{it.department}</td>
                      <td className="px-3 py-2 text-right">{it.base_salary}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-blue-800 bg-blue-50/70 italic">Tidak ada data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: kartu */}
          <div className="md:hidden mt-6 space-y-3">
            {items.map((it, idx) => (
              <div
                key={`${it._id || it.nip}-${idx}`}
                className="rounded-xl border border-blue-100 bg-white shadow-sm p-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-blue-800">{it.name}</p>
                    <p className="text-[11px] text-slate-500">NIP: {it.nip}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{it.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500">{it.branch_office}</p>
                    <p className="text-[11px] text-slate-500">{it.department}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-blue-50 mt-1">
                  <span className="text-[11px] text-slate-500">Gaji Pokok</span>
                  <span className="text-sm font-semibold text-blue-700">
                    {it.base_salary}
                  </span>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="px-4 py-6 text-center text-blue-800 bg-blue-50/70 rounded-xl italic">
                Tidak ada data
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-xs sm:text-sm bg-blue-50 text-blue-800 px-3 py-2 rounded-lg border border-blue-200">Menampilkan halaman {page} dari {totalPages}</div>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 rounded-lg bg-blue-800 text-white">Prev</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 rounded-lg bg-blue-800 text-white">Next</button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button onClick={exportToExcel} className="px-4 py-2 rounded-lg bg-blue-800 text-white flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export to Excel
            </button>
          </div>
        </div>
      </div>

      {importOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-800">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-800">Impor Daftar Tunjangan Karyawan</h2>
            <p className="text-blue-700 mt-3">Impor Data di sini:</p>
            <div className="mt-2 border-2 border-blue-300 rounded-xl px-3 py-3 bg-white">
              <input className="w-full" type="file" accept=".xls,.xlsx" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
            </div>
            <p className="text-blue-700 mt-3 text-sm">Pastikan anda telah membuat file impor dengan format .xls atau .xlsx sesuai dengant template yang disediakan. Untuk mendapatkan template, silakan klik tombol download format import dibawah.</p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <button onClick={downloadImportTemplate} className="px-4 py-2 rounded-xl bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" />Download Format Import</button>
              <button onClick={handleImport} className="px-4 py-2 rounded-xl bg-blue-800 text-white">Import Data</button>
              <button onClick={() => setImportOpen(false)} className="px-4 py-2 rounded-xl bg-gray-200 text-blue-900">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {addModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-800">
            <h2 className="text-xl font-bold text-blue-800">Tambah Data Gaji Ustadz</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-blue-800">NIP</label>
                <input value={addNip} onChange={(e) => setAddNip(e.target.value)} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-blue-800">Gaji Pokok</label>
                <input value={addAmount} onChange={(e) => setAddAmount(e.target.value.replace(/[^0-9.]/g, ""))} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => { const amt = Number(addAmount.replace(/\D/g, "")) || 0; if (!addNip.trim()) { toast.error("NIP wajib diisi"); return; } setPendingAdds((prev) => [...prev, { nip: addNip.trim(), amount: amt }]); setAddNip(""); setAddAmount(""); setAddModalOpen(false); setAdding(true); toast.success("Data ditambahkan ke draft"); }} className="px-4 py-2 rounded-xl bg-blue-800 text-white">Tambah</button>
              <button onClick={() => setAddModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-200 text-blue-900">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
