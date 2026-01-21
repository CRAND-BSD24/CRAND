"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createFixedCut, getFixedCutById } from "../action";
import { toast } from "sonner";

export default function CreateFixedCutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params?.get("edit") || "";

  const [name, setName] = useState("");
  const [priority, setPriority] = useState("");
  const [type, setType] = useState<"Harian" | "Bulanan">("Harian");
  const [saving, setSaving] = useState(false);

  const sanitizeNumber = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    return digits.replace(/^0+/, "");
  };

  useEffect(() => {
    (async () => {
      if (editId) {
        const row = await getFixedCutById(editId);
        if (row) {
          setName(row.name || "");
          setPriority(String(row.priority ?? ""));
          setType((row.type as any) === "Bulanan" ? "Bulanan" : "Harian");
        }
      }
    })();
  }, [editId]);

  const handleSave = async () => {
    const nm = name.trim();
    const pr = Number(sanitizeNumber(priority || "0")) || 0;
    if (!nm) {
      toast.error("Nama wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await createFixedCut({ name: nm, priority: pr, type });
      if (res.success) {
        toast.success("Data tersimpan");
        router.push("/hrd/fixedCuts");
      } else {
        toast.error(res.message || "Gagal menyimpan");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
      <div className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-6 border-t-4 border-emerald-800">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800">{editId ? "Ubah Potongan Tetap" : "Tambah Potongan Tetap"}</h1>
          <button onClick={() => router.push('/hrd/fixedCuts')} className="px-4 py-2 rounded-xl bg-emerald-800 text-white">Batal</button>
        </div>
        <p className="text-emerald-700 mt-2">Lengkapi data potongan tetap</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm text-emerald-800">Nama Potongan</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2"
              placeholder="Contoh: Potongan Kedisiplinan"
            />
          </div>

          <div>
            <label className="text-sm text-emerald-800">Prioritas</label>
            <input
              type="text"
              inputMode="numeric"
              value={priority}
              onChange={(e) => setPriority(sanitizeNumber(e.target.value))}
              className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2"
              placeholder="Contoh: 1"
            />
          </div>

          <div>
            <label className="text-sm text-emerald-800">Tipe</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value === "Bulanan" ? "Bulanan" : "Harian")}
              className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2"
            >
              <option value="Harian">Harian</option>
              <option value="Bulanan">Bulanan</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-emerald-800 text-white">
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}