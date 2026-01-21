"use client";

import { useEffect, useState } from "react";
import { addPicByEmail, getPicUsers } from "./action";
import { toast } from "sonner";

export default function PicUsersPage() {
  const [items, setItems] = useState<{ id?: string; name: string; email: string }[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getPicUsers();
      setItems(data);
    })();
  }, []);

  const add = async () => {
    if (!email.trim()) {
      toast.error("Email wajib diisi");
      return;
    }
    setLoading(true);
    const res = await addPicByEmail(email.trim());
    setLoading(false);
    if (res.success) {
      toast.success("Tersimpan");
      setEmail("");
      const data = await getPicUsers();
      setItems(data);
    } else {
      toast.error(res.message || "Gagal menyimpan");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-6 border-t-4 border-emerald-800">
        <h1 className="text-2xl font-bold text-emerald-800">Akun Penanggung Jawab</h1>
        <p className="text-emerald-700 mt-1 text-sm">Tambahkan user sebagai PIC berdasarkan email</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-2 border-emerald-300 rounded-xl px-3 py-2"
            placeholder="Email user"
          />
          <button onClick={add} disabled={loading} className="px-4 py-2 rounded-xl bg-emerald-800 text-white">
            {loading ? "Menyimpan..." : "Tambah"}
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-800 text-white">
                <th className="px-3 py-2 text-left">Nama</th>
                <th className="px-3 py-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id || it.email} className="odd:bg-white even:bg-emerald-50/50">
                  <td className="px-3 py-2">{it.name}</td>
                  <td className="px-3 py-2">{it.email}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-emerald-800 bg-emerald-50/70 italic">Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}