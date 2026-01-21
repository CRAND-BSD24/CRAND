"use client";

import { useEffect, useState } from "react";
import { getExperimentalSettings, upsertExperimentalSetting } from "./action";
import { toast } from "sonner";

export default function ExperimentalSettingsIndexPage() {
  const [items, setItems] = useState<{ id?: string; key: string; value: string }[]>([]);
  const [keyName, setKeyName] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getExperimentalSettings();
      setItems(data);
    })();
  }, []);

  const add = async () => {
    if (!keyName.trim()) {
      toast.error("Key wajib diisi");
      return;
    }
    setLoading(true);
    const res = await upsertExperimentalSetting(keyName.trim(), value);
    setLoading(false);
    if (res.success) {
      toast.success("Tersimpan");
      setKeyName("");
      setValue("");
      const data = await getExperimentalSettings();
      setItems(data);
    } else {
      toast.error(res.message || "Gagal menyimpan");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-6 border-t-4 border-emerald-800">
        <h1 className="text-2xl font-bold text-emerald-800">Pengaturan (Eksperimental)</h1>
        <p className="text-emerald-700 mt-1 text-sm">Kelola pengaturan percobaan</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="border-2 border-emerald-300 rounded-xl px-3 py-2"
            placeholder="Key"
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border-2 border-emerald-300 rounded-xl px-3 py-2"
            placeholder="Value"
          />
          <button onClick={add} disabled={loading} className="px-4 py-2 rounded-xl bg-emerald-800 text-white">
            {loading ? "Menyimpan..." : "Tambah"}
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-800 text-white">
                <th className="px-3 py-2 text-left">Key</th>
                <th className="px-3 py-2 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id || it.key} className="odd:bg-white even:bg-emerald-50/50">
                  <td className="px-3 py-2">{it.key}</td>
                  <td className="px-3 py-2">{it.value}</td>
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