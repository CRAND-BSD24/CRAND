"use client";

import { useEffect, useState } from "react";
import { getManagerWeeklyDashboardData } from "./dashboard/action";

interface ManagerWeeklyDashboardData {
  weeks: { label: string; start: string; end: string }[];
  teacherAttendancePct: number[];
  studentsMin5Count: number[];
  thisWeek: { attendancePct: number; studentsMin5Count: number };
}

export default function ManagerDashboardPage() {
  const [data, setData] = useState<ManagerWeeklyDashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getManagerWeeklyDashboardData();
        setData(res);
      } catch (err) {
        console.error("Gagal memuat data dashboard manager", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6 border-t-4 border-emerald-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800">Dashboard Manajer</h1>
        <p className="text-emerald-700 mt-2">Ringkasan mingguan: kehadiran ustadz dan capaian hafalan santri.</p>

        {loading ? (
          <div className="mt-6 text-emerald-700">Memuat data...</div>
        ) : data ? (
          <div className="mt-6 space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-800 font-medium">Kehadiran Ustadz (Minggu Ini)</p>
                <p className="text-3xl font-bold text-emerald-900">{(data.thisWeek.attendancePct ?? 0).toFixed(1)}%</p>
                <p className="text-xs text-emerald-700">Persentase hadir dari total hari kerja</p>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <p className="text-sm text-teal-800 font-medium">Santri ≥ 5 Halaman (Minggu Ini)</p>
                <p className="text-3xl font-bold text-teal-900">{data.thisWeek.studentsMin5Count ?? 0}</p>
                <p className="text-xs text-teal-700">Jumlah santri yang mencapai minimal 5 halaman</p>
              </div>
            </div>

            {/* Weekly table */}
            <div className="bg-white/80 rounded-xl border border-emerald-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-emerald-100">
                <p className="font-semibold text-emerald-900">Per Minggu (4 Minggu Terakhir)</p>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-50 text-emerald-800">
                      <th className="px-3 py-2 text-left">Minggu</th>
                      <th className="px-3 py-2 text-left">% Kehadiran Ustadz</th>
                      <th className="px-3 py-2 text-left">Santri ≥ 5 Halaman</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.weeks.map((w, i) => (
                      <tr key={w.label} className="border-b border-emerald-100">
                        <td className="px-3 py-2 font-medium text-emerald-900">{w.label}</td>
                        <td className="px-3 py-2">{(data.teacherAttendancePct[i] ?? 0).toFixed(1)}%</td>
                        <td className="px-3 py-2">{data.studentsMin5Count[i] ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-emerald-700">Tidak ada data untuk ditampilkan.</div>
        )}
      </div>
    </div>
  );
}