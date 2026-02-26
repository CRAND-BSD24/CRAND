"use client";

import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Wallet, Calculator } from "lucide-react";

interface SalaryItem {
  teacher_id: string;
  name: string;
  email: string;
  base_salary: number;
  attendance_count: number;
  total_salary: number;
}

export default function HrdSalaryPage() {
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<SalaryItem[]>([]);
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [editingOther, setEditingOther] = useState<Record<string, number>>({});

  const formatCurrency = useMemo(
    () => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }),
    []
  );

  async function loadData(targetYear = year, targetMonth = month) {
    try {
      setLoading(true);
      const res = await fetch(`/api/hrd/salary/list?year=${targetYear}&month=${targetMonth}`);
      if (!res.ok) throw new Error("Gagal memuat data gaji");
      const data = await res.json();
      setItems(data.items || []);
      setYear(data.year || targetYear);
      setMonth(data.month || targetMonth);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat data gaji");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveBaseSalary(teacherId: string) {
    const val = editing[teacherId];
    if (val === undefined || val === null) {
      toast.error("Masukkan gaji pokok yang valid");
      return;
    }
    try {
      const res = await fetch('/api/hrd/salary/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, baseSalary: Number(val) })
      });
      if (!res.ok) throw new Error('Gagal menyimpan gaji pokok');
      toast.success('Gaji pokok tersimpan');
      setEditing(prev => ({ ...prev, [teacherId]: Number(val) }));
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error('Gagal menyimpan gaji pokok');
    }
  }

  function onMonthInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value; // format YYYY-MM
    if (!value) return;
    const [yStr, mStr] = value.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    if (y && m) {
      setYear(y);
      setMonth(m);
    }
  }

  async function applyFilter() {
    await loadData(year, month);
  }

  async function downloadSlip(teacherId: string, name: string) {
    try {
      const otherIncome = editingOther[teacherId] ?? 0;
      const res = await fetch(`/api/hrd/salary/slip?teacherId=${teacherId}&year=${year}&month=${month}&otherIncome=${otherIncome}`);
      if (!res.ok) throw new Error("Gagal membuat slip gaji");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const pad2 = (n: number) => String(n).padStart(2, "0");
      link.href = url;
      link.download = `Slip-Gaji-${name?.replace(/\s+/g, "_") || "Ustadz"}-${year}-${pad2(month)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("Gagal mengunduh slip gaji");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#BEE5E6] to-[#9ACBD0] pt-6 pb-10">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-blue-700 text-white rounded-xl mr-3">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Gaji Ustadz</h1>
              <p className="text-blue-700 text-sm">Perhitungan: Gaji Pokok + (Total Kehadiran x 10.000) + Lain-lain</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-end gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-blue-900/80 mb-1">Bulan</label>
              <input
                type="month"
                value={`${year}-${String(month).padStart(2, '0')}`}
                onChange={onMonthInputChange}
                className="border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={applyFilter} disabled={loading}>
              {loading ? "Memuat..." : "Tampilkan"}
            </Button>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="group transition-all duration-300 bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-900/80">Total Ustadz</div>
                <div className="text-2xl font-bold text-blue-900">{items.length}</div>
              </div>
              <div className="p-2 bg-blue-700 text-white rounded-lg"><Wallet className="w-4 h-4" /></div>
            </div>
          </div>
          <div className="group transition-all duration-300 bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-900/80">Total Kehadiran</div>
                <div className="text-2xl font-bold text-blue-900">{items.reduce((a, b) => a + (b.attendance_count || 0), 0)}</div>
              </div>
              <div className="p-2 bg-blue-600 text-white rounded-lg"><Calculator className="w-4 h-4" /></div>
            </div>
          </div>
          <div className="group transition-all duration-300 bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-900/80">Total Gaji</div>
                <div className="text-2xl font-bold text-blue-900">{formatCurrency.format(items.reduce((a, b) => a + (b.total_salary || 0), 0))}</div>
              </div>
              <div className="p-2 bg-amber-500 text-white rounded-lg"><Wallet className="w-4 h-4" /></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-blue-900 flex items-center">
              <div className="w-1 h-5 bg-blue-600 rounded-full mr-2"></div>
              Tabel Gaji Ustadz
            </h3>
          </div>
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Gaji Pokok</TableHead>
                  <TableHead className="text-center">Kehadiran</TableHead>
                  <TableHead className="text-right">Lain-lain</TableHead>
                  <TableHead className="text-right">Total Gaji</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-blue-900/70 py-6">
                      {loading ? 'Memuat...' : 'Tidak ada data' }
                    </TableCell>
                  </TableRow>
                )}
                {items.map((it) => {
                  const currentBase = editing[it.teacher_id] ?? it.base_salary ?? 0;
                  const otherIncome = editingOther[it.teacher_id] ?? 0;
                  const calculatedTotal = (Number(currentBase) || 0) + (it.attendance_count || 0) * 10000 + (Number(otherIncome) || 0);
                  return (
                    <TableRow key={it.teacher_id}>
                      <TableCell className="font-medium">{it.name}</TableCell>
                      <TableCell>{it.email}</TableCell>
                      <TableCell className="text-right w-[220px]">
                        <div className="flex items-center gap-2 justify-end">
                          <Input
                            className="w-40 text-right"
                            type="number"
                            min={0}
                            value={currentBase}
                            onChange={(e) => setEditing(prev => ({ ...prev, [it.teacher_id]: Number(e.target.value) }))}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{it.attendance_count}</TableCell>
                      <TableCell className="text-right w-[180px]">
                        <Input
                          className="w-36 text-right"
                          type="number"
                          min={0}
                          value={editingOther[it.teacher_id] ?? 0}
                          onChange={(e) => setEditingOther(prev => ({ ...prev, [it.teacher_id]: Number(e.target.value) }))}
                        />
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency.format(calculatedTotal)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="default" onClick={() => saveBaseSalary(it.teacher_id)}>
                            Simpan
                          </Button>
                          <Button variant="outline" onClick={() => downloadSlip(it.teacher_id, it.name)}>
                            <Download className="w-4 h-4 mr-1" /> Slip PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </main>
  );
}