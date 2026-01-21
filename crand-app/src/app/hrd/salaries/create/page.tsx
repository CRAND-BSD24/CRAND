"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getBaseSalaryEntries, replaceBaseSalaryEntries, deleteBaseSalaryEntry, getPositionsFromDB } from "../action";
import { toast } from "sonner";

export default function CreateBaseSalaryPage() {
  const params = useSearchParams();
  const router = useRouter();
  const job = params?.get("job") || "";
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<{ _id?: string; years_of_service: string; amount: string }[]>([]);

  const formatThousands = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const cleaned = digits.replace(/^0+/, "");
    if (!cleaned) return "";
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const sanitizeYears = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    return digits.replace(/^0+/, "");
  };

  useEffect(() => {
    (async () => {
      const rows = await getBaseSalaryEntries(job);
      if (rows.length > 0) {
        setEntries(rows.map((r) => ({ _id: r._id, years_of_service: String(r.years_of_service || ""), amount: formatThousands(String(r.amount || "")) })));
        return;
      }
      // Fallback: coba map ke nama kanonik dari job_positions
      const normalizeKey = (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, " ").trim().replace(/\s{2,}/g, " ");
      const list = await getPositionsFromDB();
      const key = normalizeKey(job);
      const canonical = list.find((p) => normalizeKey(p) === key) || job;
      if (canonical !== job) {
        const rows2 = await getBaseSalaryEntries(canonical);
        if (rows2.length > 0) {
          setEntries(rows2.map((r) => ({ _id: r._id, years_of_service: String(r.years_of_service || ""), amount: formatThousands(String(r.amount || "")) })));
          return;
        }
      }
      setEntries([{ years_of_service: "", amount: "" }]);
    })();
  }, [job]);

  const addEntry = () => {
    setEntries((prev) => [...prev, { years_of_service: "", amount: "" }]);
  };

  const removeEntry = async (idx: number) => {
    const target = entries[idx];
    if (target?._id) {
      try {
        await deleteBaseSalaryEntry(target._id);
      } catch (e) {
        toast.error("Gagal menghapus dari database");
      }
    }
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!job) {
      toast.error("Jabatan tidak valid");
      return;
    }
    const valid = entries.every((e) => e.amount !== undefined && e.years_of_service !== undefined);
    if (!valid) {
      toast.error("Isi Masa Bakti/Nominal dengan benar");
      return;
    }
    setSaving(true);
    try {
      const payload = entries.map(({ years_of_service, amount }) => ({
        years_of_service: Number(sanitizeYears(years_of_service || "0")) || 0,
        amount: Number((amount || "").replaceAll(".", "")) || 0,
      }));
      const res = await replaceBaseSalaryEntries(job, payload);
      if (res.success) {
        toast.success("Data gaji pokok tersimpan");
        router.push("/hrd/salaries");
      } else {
        toast.error("Gagal menyimpan");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-6 border-t-4 border-emerald-800">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800">Tambah Gaji Pokok</h1>
          <button onClick={() => router.push('/hrd/salaries')} className="px-4 py-2 rounded-xl bg-emerald-800 text-white">Kembali</button>
        </div>
        <p className="text-emerald-700 mt-2">Jabatan: <span className="font-semibold">{job}</span></p>

        <div className="mt-6 space-y-3">
          {entries.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
              <div className="md:col-span-4">
                <label className="text-sm text-emerald-800">Masa Bakti (Tahun)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={row.years_of_service}
                  onChange={(e) => {
                    const v = sanitizeYears(e.target.value);
                    setEntries((prev) => prev.map((r, i) => (i === idx ? { ...r, years_of_service: v } : r)));
                  }}
                  className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2"
                />
              </div>
              <div className="md:col-span-6">
                <label className="text-sm text-emerald-800">Nominal Gaji Pokok</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={row.amount}
                  onChange={(e) => {
                    const v = formatThousands(e.target.value);
                    setEntries((prev) => prev.map((r, i) => (i === idx ? { ...r, amount: v } : r)));
                  }}
                  className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-emerald-800">Aksi</label>
                <button onClick={() => removeEntry(idx)} className="w-full px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          ))}
          <div>
            <button onClick={addEntry} className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200">Tambah</button>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl bg-emerald-800 text-white disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan"}</button>
          <button onClick={() => router.push('/hrd/salaries')} className="px-5 py-2 rounded-xl bg-gray-200 text-emerald-900">Batal</button>
        </div>
      </div>
    </div>
  );
}