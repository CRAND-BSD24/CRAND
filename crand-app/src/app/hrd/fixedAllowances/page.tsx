"use client";

import { useEffect, useMemo, useState } from "react";
import { searchFixedAllowances, getFixedAllowancesAll } from "./action";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function FixedAllowancesPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [items, setItems] = useState<{ id?: string; name: string; priority: number; type: string; apply_at: string }[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await searchFixedAllowances(query, page, pageSize);
      setItems(res.items);
      setTotalCount(res.totalCount);
    })();
  }, [query, page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount]);

  const exportToExcel = async () => {
    const all = await getFixedAllowancesAll(query);
    const header = ["Nama", "Prioritas", "Tipe", "Aktif Disaat"];
    const rows = all.map((it) => [it.name, it.priority, it.type, it.apply_at]);
    const data = [header, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TunjanganTetap");
    XLSX.writeFile(wb, "tunjangan-tetap.xlsx");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 to-teal-50 p-3 sm:p-8">
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-t-4 border-blue-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">Tunjangan Tetap</h1>
              <p className="text-blue-700 mt-1 text-sm">Kelola tunjangan tetap</p>
            </div>
            <div className="flex gap-2">
              <Link href="/hrd/fixedAllowances/create" className="px-4 py-2 rounded-xl bg-blue-800 text-white">Tambah Baru</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="sm:col-span-1">
              <label className="text-xs text-blue-800">Cari Data</label>
              <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Desktop: tabel */}
          <div className="hidden sm:block rounded-xl border border-blue-100 mt-6">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-800 text-white">
                    <th className="px-3 py-2 text-left">Nama</th>
                    <th className="px-3 py-2 text-left">Prioritas</th>
                    <th className="px-3 py-2 text-left">Tipe</th>
                    <th className="px-3 py-2 text-left">Aktif Disaat</th>
                    <th className="px-3 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={it.id || `${it.name}-${idx}`} className="odd:bg-white even:bg-blue-50/50">
                      <td className="px-3 py-2">{it.name}</td>
                      <td className="px-3 py-2">{it.priority}</td>
                      <td className="px-3 py-2">{it.type}</td>
                      <td className="px-3 py-2">{it.apply_at}</td>
                      <td className="px-3 py-2">
                        <Link href={`/hrd/fixedAllowances/create?edit=${encodeURIComponent(it.id || "")}`} className="text-blue-800">Edit</Link>
                      </td>
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
          <div className="sm:hidden mt-6 space-y-3">
            {items.map((it, idx) => (
              <div
                key={it.id || `${it.name}-${idx}`}
                className="rounded-xl border border-blue-100 bg-white shadow-sm p-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-blue-800">{it.name}</p>
                    <p className="text-[11px] text-slate-500">Prioritas: {it.priority}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500">{it.type}</p>
                    <p className="text-[11px] text-slate-500">{it.apply_at}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-1 border-t border-blue-50 mt-1">
                  <Link
                    href={`/hrd/fixedAllowances/create?edit=${encodeURIComponent(it.id || "")}`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-800 text-white"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="px-4 py-6 text-center text-blue-800 bg-blue-50/70 rounded-xl italic">
                Tidak ada data
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 bg-blue-800 text-white rounded-xl">Prev</button>
              <span className="text-blue-800 text-sm">Hal {page} dari {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 bg-blue-800 text-white rounded-xl">Next</button>
            </div>
            <button onClick={exportToExcel} className="px-4 py-2 rounded-xl bg-blue-800 text-white">Export to Excel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
