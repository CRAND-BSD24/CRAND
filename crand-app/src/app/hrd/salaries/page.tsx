"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPositionsFromDB, importBaseSalariesFromXLS, importBaseSalariesRows, generateBaseSalaryImportTemplate } from "./action";
import * as XLSX from "xlsx";
import { Search, ChevronLeft, ChevronRight, Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export default function HrdSalariesPage() {
  const [positions, setPositions] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      const list = await getPositionsFromDB(query);
      setPositions(list);
      setCurrentPage(1);
    })();
  }, [query]);

  const pageSize = 10;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(positions.length / pageSize)), [positions.length]);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, positions.length);
  const current = positions.slice(startIndex, endIndex);

  const downloadTemplate = async () => {
    const html = await generateBaseSalaryImportTemplate();
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-impor-gaji-pokok.xls";
    a.click();
    URL.revokeObjectURL(url);
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
      let res: any = null;
      try {
        const wb = XLSX.read(ab, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
        const header = (rows[0] || []).map((x) => String(x || "").trim().toLowerCase());
        const findIdx = (cands: string[]) => header.findIndex((h) => cands.includes(h));
        const idxJob = findIdx(["jabatan", "nama jabatan"]);
        const idxYears = findIdx(["masa bakti", "masa bakti (tahun)", "masa bakti tahun", "masa_bakti"]);
        const idxAmount = findIdx(["nominal", "nominal gaji", "nominal gaji pokok", "gaji pokok", "nominal_gaji"]);
        const ji = idxJob >= 0 ? idxJob : 0;
        const yi = idxYears >= 0 ? idxYears : 1;
        const ai = idxAmount >= 0 ? idxAmount : 2;
        const items: { position: string; years_of_service: number; amount: number }[] = [];
        for (let r = 1; r < rows.length; r++) {
          const row = rows[r] || [];
          const position = String(row[ji] ?? "").trim();
          const yearsRaw = String(row[yi] ?? "");
          const amountRaw = String(row[ai] ?? "");
          const years = Number(yearsRaw.replace(/\D/g, "")) || 0;
          const amount = Number(amountRaw.replace(/\D/g, "")) || 0;
          if (!position) continue;
          items.push({ position, years_of_service: years, amount });
        }
        res = await importBaseSalariesRows(items);
      } catch (e) {
        const text = await importFile.text();
        res = await importBaseSalariesFromXLS(text);
      }
      if (res?.success) {
        toast.success(`Impor berhasil: ${res.inserted} entri, ${res.positionsAdded} jabatan baru`);
        const list = await getPositionsFromDB(query);
        setPositions(list);
        setImportOpen(false);
        setImportFile(null);
      } else {
        toast.error("Gagal memproses impor");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan saat impor");
    }
  };

  const exportToCSV = () => {
    const csv = ["Jabatan", ...positions].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "daftar-gaji-pokok-jabatan.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 to-teal-50 px-0 sm:px-8 py-3 sm:py-8">
      <div className="max-w-6xl mx-auto mt-13">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border-t-4 border-blue-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 flex items-center gap-2 sm:gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V8l-6-6H5z" />
                </svg>
                Daftar Gaji Pokok
              </h1>
              <p className="text-blue-700 mt-1 pl-8 sm:pl-11 text-sm sm:text-base">Kelola gaji pokok per jabatan</p>
            </div>
            <button onClick={() => setImportOpen(true)} className="bg-blue-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 shadow-md">
              <Upload className="h-4 w-4" />
              Impor Data
            </button>
          </div>

          <div className="mb-4">
            <label className="text-xs text-blue-800">Cari Data</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 h-4 w-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border-2 border-blue-300 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Desktop: tabel */}
          <div className="hidden sm:block rounded-xl border border-blue-100">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-800 text-white">
                    <th className="px-3 py-2 text-left font-semibold rounded-tl-lg">Jabatan</th>
                    <th className="px-3 py-2 text-right font-semibold rounded-tr-lg">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {current.map((job) => (
                    <tr key={job} className="odd:bg-white even:bg-blue-50/50">
                      <td className="px-3 py-2">{job}</td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end">
                          <Link href={`/hrd/salaries/create?job=${encodeURIComponent(job)}`} className="px-3 py-1.5 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-all text-sm">
                            Tambahkan Gaji Pokok
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {current.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-blue-800 bg-blue-50/70 italic">Tidak ada data jabatan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: kartu */}
          <div className="sm:hidden mt-4 space-y-3">
            {current.map((job) => (
              <div
                key={job}
                className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-3 shadow-sm"
              >
                <div className="flex-1 mr-3">
                  <p className="text-sm font-semibold text-blue-800">{job}</p>
                </div>
                <Link
                  href={`/hrd/salaries/create?job=${encodeURIComponent(job)}`}
                  className="text-xs px-3 py-1.5 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Tambah
                </Link>
              </div>
            ))}
            {current.length === 0 && (
              <div className="px-4 py-6 text-center text-blue-800 bg-blue-50/70 rounded-xl italic">
                Tidak ada data jabatan
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-xs sm:text-sm bg-blue-50 text-blue-800 px-3 py-2 rounded-lg border border-blue-200">
                Menampilkan <span className="font-bold">{startIndex + 1}</span> - <span className="font-bold">{endIndex}</span> dari <span className="font-bold">{positions.length}</span> jabatan
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className={`p-2 rounded-lg ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-800 text-white'}`}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`min-w-[32px] h-8 rounded-lg text-sm ${currentPage === page ? 'bg-blue-800 text-white font-bold' : 'bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-800'}`}>{page}</button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`p-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-800 text-white'}`}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button onClick={exportToCSV} className="px-4 py-2 rounded-lg bg-blue-800 text-white flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export to Excel
            </button>
          </div>
        </div>
      </div>

      {importOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-800">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-800">Impor Data Gaji Pokok</h2>
            <p className="text-blue-700 mt-3">Impor Data di sini:</p>
            <div className="mt-2 border-2 border-blue-300 rounded-xl px-3 py-3 bg-white">
              <input
                className="w-full"
                type="file"
                accept=".xls,.xlsx"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
            <p className="text-blue-700 mt-3">Pastikan anda telah membuat file impor dengan format .xls atau .xlsx sesuai dengan template yang disediakan. Untuk mendapatkan template, silakan klik tombol download format import dibawah.</p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <button onClick={downloadTemplate} className="px-4 py-2 rounded-xl bg-blue-800 text-white">Download Format Import</button>
              <button onClick={handleImport} className="px-4 py-2 rounded-xl bg-blue-800 text-white">Import Data</button>
              <button onClick={() => setImportOpen(false)} className="px-4 py-2 rounded-xl bg-gray-200 text-blue-900">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
