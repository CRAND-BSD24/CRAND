"use client";

import { useEffect, useState } from "react";
import { addLatePenaltyTier, getLatePenaltyTiers } from "./action";
import { toast } from "sonner";

export default function LatePenaltyTiersPage() {
  const [items, setItems] = useState<{ id?: string; minutes: number; penalty: number }[]>([]);
  const [minutes, setMinutes] = useState("0");
  const [penalty, setPenalty] = useState("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getLatePenaltyTiers();
      setItems(data);
    })();
  }, []);

  const add = async () => {
    const mn = Number(minutes);
    const pn = Number(penalty);
    if (!Number.isFinite(mn) || mn <= 0) {
      toast.error("Menit tidak valid");
      return;
    }
    if (!Number.isFinite(pn) || pn < 0) {
      toast.error("Denda tidak valid");
      return;
    }
    setLoading(true);
    const res = await addLatePenaltyTier(mn, pn);
    setLoading(false);
    if (res.success) {
      toast.success("Tersimpan");
      setMinutes("0");
      setPenalty("0");
      const data = await getLatePenaltyTiers();
      setItems(data);
    } else {
      toast.error(res.message || "Gagal menyimpan");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-800">
        <h1 className="text-2xl font-bold text-blue-800">Denda Keterlambatan Bertingkat</h1>
        <p className="text-blue-700 mt-1 text-sm">Kelola denda berdasarkan tingkat menit keterlambatan</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="border-2 border-blue-300 rounded-xl px-3 py-2"
            placeholder="Menit keterlambatan"
          />
          <input
            value={penalty}
            onChange={(e) => setPenalty(e.target.value)}
            className="border-2 border-blue-300 rounded-xl px-3 py-2"
            placeholder="Nominal denda"
          />
          <button onClick={add} disabled={loading} className="px-4 py-2 rounded-xl bg-blue-800 text-white">
            {loading ? "Menyimpan..." : "Tambah"}
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-blue-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="px-3 py-2 text-left">Menit</th>
                <th className="px-3 py-2 text-right">Denda</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id || it.minutes} className="odd:bg-white even:bg-blue-50/50">
                  <td className="px-3 py-2">{it.minutes}</td>
                  <td className="px-3 py-2 text-right">{it.penalty}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-blue-800 bg-blue-50/70 italic">Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}