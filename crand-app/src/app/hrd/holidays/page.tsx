"use client";

import { useEffect, useState } from "react";
import { addHoliday, getHolidays } from "./action";
import { toast } from "sonner";

export default function HolidaysPage() {
  const [items, setItems] = useState<{ id?: string; name: string; date: string }[]>([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getHolidays();
      const mapped = data.map((it: any) => ({ ...it, date: new Date(it.date).toISOString().slice(0, 10) }));
      setItems(mapped);
    })();
  }, []);

  const add = async () => {
    if (!name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    if (!date) {
      toast.error("Tanggal wajib diisi");
      return;
    }
    setLoading(true);
    const res = await addHoliday(name.trim(), date);
    setLoading(false);
    if (res.success) {
      toast.success("Tersimpan");
      setName("");
      setDate("");
      const data = await getHolidays();
      const mapped = data.map((it: any) => ({ ...it, date: new Date(it.date).toISOString().slice(0, 10) }));
      setItems(mapped);
    } else {
      toast.error(res.message || "Gagal menyimpan");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-800">
        <h1 className="text-2xl font-bold text-blue-800">Waktu Libur</h1>
        <p className="text-blue-700 mt-1 text-sm">Kelola hari libur</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-2 border-blue-300 rounded-xl px-3 py-2"
            placeholder="Nama libur"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-2 border-blue-300 rounded-xl px-3 py-2"
          />
          <button onClick={add} disabled={loading} className="px-4 py-2 rounded-xl bg-blue-800 text-white">
            {loading ? "Menyimpan..." : "Tambah"}
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-blue-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="px-3 py-2 text-left">Tanggal</th>
                <th className="px-3 py-2 text-left">Nama</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id || it.date} className="odd:bg-white even:bg-blue-50/50">
                  <td className="px-3 py-2">{it.date}</td>
                  <td className="px-3 py-2">{it.name}</td>
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