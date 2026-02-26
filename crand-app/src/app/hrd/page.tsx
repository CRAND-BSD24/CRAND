"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Wallet, Users, Calendar, Camera, Clock, AlertTriangle, CheckCircle2, Heart, Plane, FileText, UserCog, UserPlus, Trash2 } from "lucide-react";
import Link from "next/link";

interface SalaryItem {
  teacher_id: string;
  name: string;
  email: string;
  base_salary: number;
  attendance_count: number;
  total_salary: number;
}

export default function HrdDashboardPage() {
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SalaryItem[]>([]);

  const formatCurrency = useMemo(
    () => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }),
    []
  );

  async function loadData(targetYear = year, targetMonth = month) {
    try {
      setLoading(true);
      const res = await fetch(`/api/hrd/salary/list?year=${targetYear}&month=${targetMonth}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      setItems(data.items || []);
      setYear(data.year || targetYear);
      setMonth(data.month || targetMonth);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalTeachers = items.length;
  const totalAttendance = items.reduce((a, b) => a + (b.attendance_count || 0), 0);
  const totalSalary = items.reduce((a, b) => a + (b.total_salary || 0), 0);

  const pad2 = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-blue-700 text-white rounded-xl mr-3">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Dashboard HRD</h1>
              <p className="text-blue-700 text-sm">Ringkasan periode {year}-{pad2(month)}</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-end gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-blue-900/80 mb-1">Bulan</label>
              <input
                type="month"
                value={`${year}-${pad2(month)}`}
                onChange={(e) => {
                  const [yStr, mStr] = e.target.value.split("-");
                  const y = parseInt(yStr, 10);
                  const m = parseInt(mStr, 10);
                  if (y && m) {
                    setYear(y);
                    setMonth(m);
                  }
                }}
                className="border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <Button
              className="bg-blue-700 hover:bg-blue-800"
              onClick={() => loadData(year, month)}
              disabled={loading}
            >
              {loading ? "Memuat..." : "Tampilkan"}
            </Button>
          </div>
        </div>

      {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Jumlah Ustadz */}
          <Link href="/hrd/teachers" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Jumlah Ustadz</CardTitle>
                  <div className="p-2 bg-blue-700 text-white rounded-lg"><Users className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{totalTeachers}</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Persetujuan Cuti */}
          <Link href="/hrd/teacherEvents" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Persetujuan Cuti</CardTitle>
                  <div className="p-2 bg-pink-600 text-white rounded-lg"><Camera className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Persetujuan Perizinan Ustadz/Educator */}
          <Link href="/hrd/teacherLeaves" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Persetujuan Perizinan Ustadz/Educator</CardTitle>
                  <div className="p-2 bg-blue-600 text-white rounded-lg"><Calendar className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Persetujuan Lembur */}
          <Link href="/hrd/teacherEvents" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Persetujuan Lembur</CardTitle>
                  <div className="p-2 bg-blue-700 text-white rounded-lg"><Clock className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Persetujuan Pembiayaan */}
          <Link href="/hrd/teacherContracts" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Persetujuan Pembiayaan</CardTitle>
                  <div className="p-2 bg-blue-600 text-white rounded-lg"><Wallet className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Check in tepat waktu hari ini */}
          <Link href="/hrd/attendance" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Check in Tepat Waktu</CardTitle>
                  <div className="p-2 bg-blue-600 text-white rounded-lg"><Calendar className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Terlambat */}
          <Link href="/hrd/attendance" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Terlambat</CardTitle>
                  <div className="p-2 bg-red-600 text-white rounded-lg"><AlertTriangle className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Belum check in hari ini */}
          <Link href="/hrd/attendance" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Belum Check In</CardTitle>
                  <div className="p-2 bg-gray-600 text-white rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Karyawan cuti hari ini */}
          <Link href="/hrd/teacherEvents" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Ustadz Cuti Hari Ini</CardTitle>
                  <div className="p-2 bg-yellow-500 text-white rounded-lg"><Calendar className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Persetujuan klaim kesehatan */}
          <Link href="/hrd/teacherEvents" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Persetujuan Klaim Kesehatan</CardTitle>
                  <div className="p-2 bg-rose-500 text-white rounded-lg"><Heart className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Persetujuan perjalanan dinas */}
          <Link href="/hrd/teacherEvents" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Persetujuan Perjalanan Dinas</CardTitle>
                  <div className="p-2 bg-sky-600 text-white rounded-lg"><Plane className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Kontrak segera habis */}
          <Link href="/hrd/teacherContracts" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Kontrak Segera Habis</CardTitle>
                  <div className="p-2 bg-blue-600 text-white rounded-lg"><FileText className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Total Penugasan */}
          <Link href="/hrd/teacherEvents" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Total Penugasan</CardTitle>
                  <div className="p-2 bg-teal-600 text-white rounded-lg"><UserCog className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Ulang tahun bulan ini */}
          <Link href="/hrd/teacherEvents" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Ulang Tahun Bulan Ini</CardTitle>
                  <div className="p-2 bg-orange-500 text-white rounded-lg"><UserPlus className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Permintaan Hapus Akun */}
          <Link href="/hrd/deleteTeachers" className="block h-full">
            <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-900">Permintaan Hapus Akun</CardTitle>
                  <div className="p-2 bg-red-700 text-white rounded-lg"><Trash2 className="w-4 h-4" /></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">0</div>
                <div className="mt-2 text-blue-700 text-sm underline">Lihat Detail</div>
              </CardContent>
            </Card>
          </Link>

          {/* Ringkasan Kehadiran & Gaji (tetap) */}
          <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-900">Total Kehadiran</CardTitle>
                <div className="p-2 bg-blue-600 text-white rounded-lg"><Calendar className="w-4 h-4" /></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{totalAttendance}</div>
            </CardContent>
          </Card>
          <Card className="group h-full min-h-[170px] flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm hover:bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-900">Total Gaji</CardTitle>
                <div className="p-2 bg-amber-500 text-white rounded-lg"><Wallet className="w-4 h-4" /></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{formatCurrency.format(totalSalary)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabel ringkas top 5 kehadiran */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-blue-900 flex items-center">
              <div className="w-1 h-5 bg-blue-600 rounded-full mr-2"></div>
              Top 5 Kehadiran
            </h3>
          </div>
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-center">Kehadiran</TableHead>
                  <TableHead className="text-right">Total Gaji</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items
                  .slice()
                  .sort((a, b) => (b.attendance_count || 0) - (a.attendance_count || 0))
                  .slice(0, 5)
                  .map((it) => (
                    <TableRow key={it.teacher_id}>
                      <TableCell className="font-medium">{it.name}</TableCell>
                      <TableCell className="text-center">{it.attendance_count}</TableCell>
                      <TableCell className="text-right">{formatCurrency.format(it.total_salary || 0)}</TableCell>
                    </TableRow>
                  ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-blue-900/70">
                      {loading ? "Memuat..." : "Tidak ada data"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
    </div>
  );
}
