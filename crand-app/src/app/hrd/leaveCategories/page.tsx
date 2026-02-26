"use client";

import { useEffect, useState } from "react";
import { addLeaveCategory, getLeaveCategories } from "./action";
import { toast } from "sonner";

export default function LeaveCategoriesPage() {
  const [items, setItems] = useState<{ id?: string; name: string }[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getLeaveCategories();
      setItems(data);
    })();
  }, []);

  const add = async () => {
    if (!name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    setLoading(true);
    const res = await addLeaveCategory(name.trim());
    setLoading(false);
    if (res.success) {
      toast.success("Tersimpan");
      setName("");
      const data = await getLeaveCategories();
      setItems(data);
    } else {
      toast.error(res.message || "Gagal menyimpan");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-6">
      <div className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-800">
        <h1 className="text-2xl font-bold text-blue-800">Kategori Cuti</h1>
        <p className="text-blue-700 mt-1 text-sm">Kelola kategori cuti</p>

        <div className="mt-6 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border-2 border-blue-300 rounded-xl px-3 py-2"
            placeholder="Nama kategori"
          />
          <button onClick={add} disabled={loading} className="px-4 py-2 rounded-xl bg-blue-800 text-white">
            {loading ? "Menyimpan..." : "Tambah"}
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-blue-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="px-3 py-2 text-left">Nama</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id || it.name} className="odd:bg-white even:bg-blue-50/50">
                  <td className="px-3 py-2">{it.name}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-blue-800 bg-blue-50/70 italic">Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}