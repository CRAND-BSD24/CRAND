"use client";

import { useEffect, useMemo, useState } from "react";
import { searchFixedCuts, getFixedCutsAll } from "./action";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function FixedCutsPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [items, setItems] = useState<{ id?: string; name: string; priority: number; type: string }[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await searchFixedCuts(query, page, pageSize);
      setItems(res.items);
      setTotalCount(res.totalCount);
    })();
  }, [query, page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount]);

  const exportToExcel = async () => {
    const all = await getFixedCutsAll(query);
    const header = ["Nama", "Prioritas", "Tipe"];
    const rows = all.map((it) => [it.name, it.priority, it.type]);
    const data = [header, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PotonganTetap");
    XLSX.writeFile(wb, "potongan-tetap.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-t-4 border-emerald-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800">Potongan Tetap</h1>
              <p className="text-emerald-700 mt-1 text-sm">Kelola potongan tetap</p>
            </div>
            <div className="flex gap-2">
              <Link href="/hrd/fixedCuts/create" className="px-4 py-2 rounded-xl bg-emerald-800 text-white">Tambah Baru</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="sm:col-span-1">
              <label className="text-xs text-emerald-800">Cari Data</label>
              <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-emerald-100 mt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-800 text-white">
                  <th className="px-3 py-2 text-left">Nama</th>
                  <th className="px-3 py-2 text-left">Prioritas</th>
                  <th className="px-3 py-2 text-left">Tipe</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={it.id || `${it.name}-${idx}`} className="odd:bg-white even:bg-emerald-50/50">
                    <td className="px-3 py-2">{it.name}</td>
                    <td className="px-3 py-2">{it.priority}</td>
                    <td className="px-3 py-2">{it.type}</td>
                    <td className="px-3 py-2">
                      <Link href={`/hrd/fixedCuts/create?edit=${encodeURIComponent(it.id || "")}`} className="text-emerald-800">Edit</Link>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-emerald-800 bg-emerald-50/70 italic">Tidak ada data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 bg-emerald-800 text-white rounded-xl">Prev</button>
              <span className="text-emerald-800 text-sm">Hal {page} dari {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 bg-emerald-800 text-white rounded-xl">Next</button>
            </div>
            <button onClick={exportToExcel} className="px-4 py-2 rounded-xl bg-emerald-800 text-white">Export to Excel</button>
          </div>
        </div>
      </div>
    </div>
  );
}