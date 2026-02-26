"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getPayrollReport,
  PayrollItem,
  savePayrollOverrides,
  sendSalarySlipsToAll,
} from "./action";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Download, Send } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
};

export default function PayrollsPage() {
  const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PayrollItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [overrides, setOverrides] = useState<
    Record<string, { bisyarohPokok?: number; kehadiran?: number; lainLain?: number }>
  >({});
  const [sendingSlips, setSendingSlips] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);

  const recomputeItem = (item: PayrollItem): PayrollItem => {
    const totalPendapatan =
      item.bisyarohPokok +
      item.kehadiran +
      item.tunjJabatan +
      item.tunjFungsional +
      item.tunjKeluarga +
      item.tunjAsrama +
      item.tunjMakanLaundry +
      item.lainLain;

    const totalPotongan =
      item.potTunjKeluarga +
      item.potTunjAsrama +
      item.potTunjMakanLaundry +
      item.potLainLain;

    const netBisyaroh = totalPendapatan - totalPotongan;

    return {
      ...item,
      totalPendapatan,
      totalPotongan,
      netBisyaroh,
    };
  };

  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));

  const loadData = useCallback(async (targetMonth: string, targetYear: string) => {
    setLoading(true);
    try {
      const m = parseInt(targetMonth);
      const y = parseInt(targetYear);
      const res = await getPayrollReport(m, y);
      setData(res);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const m = parseInt(month);
      const y = parseInt(year);

      // Simpan override manual ke server agar persist saat refresh
      const payload = Object.entries(overrides).map(([teacherId, ov]) => ({
        teacherId,
        bisyarohPokok: ov.bisyarohPokok,
        kehadiran: ov.kehadiran,
        lainLain: ov.lainLain,
      }));
      if (payload.length > 0) {
        await savePayrollOverrides(m, y, payload);
      }

      const res = await getPayrollReport(m, y);
      const merged = res.map((item) => {
        const ov = overrides[item.id];
        if (!ov) return item;
        const mergedItem = { ...item, ...ov };
        return recomputeItem(mergedItem);
      });
      setData(merged);
      toast.success("Data berhasil dimuat");
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(month, year);
  }, [loadData, month, year]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lower = searchQuery.toLowerCase();
    return data.filter((item) => 
      item.name.toLowerCase().includes(lower) || 
      item.position.toLowerCase().includes(lower)
    );
  }, [data, searchQuery]);

  const handleNumberChange = (
    id: string,
    field: "bisyarohPokok" | "kehadiran" | "lainLain",
    value: string
  ) => {
    const numeric = Number(value.replace(/[^\d-]/g, "")) || 0;
    setOverrides((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: numeric,
      },
    }));
    setData((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = recomputeItem({
          ...item,
          [field]: numeric,
        } as PayrollItem);
        return updated;
      })
    );
  };

  const exportToExcel = () => {
    if (filteredData.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    const exportData = filteredData.map((item, index) => ({
      No: index + 1,
      Nama: item.name,
      Jabatan: item.position,
      "Bisyaroh Pokok": item.bisyarohPokok,
      "Kehadiran (Rp)": item.kehadiran,
      "Jml Kehadiran": item.attendanceCount,
      "Tunj. Jabatan": item.tunjJabatan,
      "Tunj. Fungsional": item.tunjFungsional,
      "Tunj. Keluarga": item.tunjKeluarga,
      "Tunj. Asrama": item.tunjAsrama,
      "Tunj. Makan & Laundry": item.tunjMakanLaundry,
      "Lain-lain (Pendapatan)": item.lainLain,
      "Total Pendapatan": item.totalPendapatan,
      "Pot. Tunj. Keluarga": item.potTunjKeluarga,
      "Pot. Tunj. Asrama": item.potTunjAsrama,
      "Pot. Tunj. Makan": item.potTunjMakanLaundry,
      "Pot. Lain-lain": item.potLainLain,
      "Total Potongan": item.totalPotongan,
      "NET BISYAROH": item.netBisyaroh
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gaji Ustadz");
    XLSX.writeFile(wb, `Laporan_Gaji_${months.find(m => m.value === month)?.label}_${year}.xlsx`);
  };

  const handleSendAllSlips = async () => {
    try {
      setSendingSlips(true);
      const m = parseInt(month);
      const y = parseInt(year);
      const res = await sendSalarySlipsToAll(m, y);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message || "Gagal mengirim slip gaji.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim slip gaji.");
    } finally {
      setSendingSlips(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 to-teal-50 p-3 sm:p-6">
      <AlertDialog open={confirmSendOpen} onOpenChange={setConfirmSendOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Kirim Slip</AlertDialogTitle>
            <AlertDialogDescription>
              Slip gaji akan dikirim dan disimpan untuk semua ustadz pada
              periode {months.find((m) => m.value === month)?.label} {year}.
              Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setConfirmSendOpen(false)}
              className="w-full sm:w-auto"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setConfirmSendOpen(false);
                await handleSendAllSlips();
              }}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              Kirim Slip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="max-w-6xl w-full mx-auto mt-6 sm:mt-10 bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-t-4 border-blue-800">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">Hitung Gaji Ustadz</h1>
            <p className="text-blue-700 mt-2">Laporan penggajian bulanan.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
             <div className="relative w-full sm:w-64">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-600" />
               <Input 
                 placeholder="Cari nama atau jabatan..." 
                 className="pl-9 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
             
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-slate-600">Bulan</span>
                  <Select
                    value={month}
                    onValueChange={(val) => {
                      setMonth(val);
                      setOverrides({});
                    }}
                  >
                    <SelectTrigger className="w-[140px] min-w-[120px] border-blue-300 bg-white h-9 sm:h-10 text-sm rounded-lg px-3 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Pilih bulan" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-blue-200 rounded-lg shadow-md max-h-none">
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-slate-600">Tahun</span>
                  <Select
                    value={year}
                    onValueChange={(val) => {
                      setYear(val);
                      setOverrides({});
                    }}
                  >
                    <SelectTrigger className="w-[110px] min-w-[100px] border-blue-300 bg-white h-9 sm:h-10 text-sm rounded-lg px-3 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Pilih tahun" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-blue-200 rounded-lg shadow-md">
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={fetchData}
                  disabled={loading}
                  className="w-full sm:w-auto bg-blue-800 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Hitung"
                  )}
                </Button>
                <Button
                  onClick={() => setConfirmSendOpen(true)}
                  disabled={sendingSlips}
                  variant="outline"
                  className="w-full sm:w-auto border-blue-600 text-blue-700 hover:bg-blue-50"
                >
                  {sendingSlips ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Kirim Slip ke Semua
                </Button>
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="w-full sm:w-auto border-blue-600 text-blue-700 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
             </div>
          </div>
        </div>

        {/* Desktop: tabel besar */}
        <div className="hidden md:flex rounded-xl border border-blue-100 shadow-sm overflow-hidden flex-col max-h-[80vh]">
          <div className="overflow-auto relative w-full h-full custom-scrollbar">
            <Table className="w-full text-[11px] sm:text-xs">
              <TableHeader className="sticky top-0 z-50 bg-slate-50 shadow-sm">
                <TableRow className="border-b border-blue-100">
                  <TableHead rowSpan={2} className="w-[50px] border-r border-blue-100 text-center font-bold sticky left-0 z-40 bg-slate-50 shadow-[1px_0_0_0_rgba(16,185,129,0.1)] text-blue-900">No</TableHead>
                  <TableHead rowSpan={2} className="min-w-[200px] border-r border-blue-100 text-left font-bold sticky left-[50px] z-40 bg-slate-50 shadow-[1px_0_0_0_rgba(16,185,129,0.1)] text-blue-900">Nama</TableHead>
                  <TableHead rowSpan={2} className="min-w-[150px] border-r border-blue-100 text-left font-bold sticky left-[250px] z-40 bg-slate-50 shadow-[2px_0_0_0_rgba(16,185,129,0.1)] text-blue-900">Jabatan</TableHead>
                  <TableHead colSpan={9} className="text-center bg-blue-100 border-r border-blue-100 text-blue-800 font-bold py-2">PENDAPATAN</TableHead>
                  <TableHead colSpan={5} className="text-center bg-red-100/80 border-r border-blue-100 text-red-800 font-bold py-2">POTONGAN</TableHead>
                  <TableHead rowSpan={2} className="text-right font-bold bg-blue-200 border-b border-blue-100 min-w-[150px] text-blue-900 sticky right-0 z-40 shadow-[-2px_0_0_0_rgba(16,185,129,0.1)]">NET BISYAROH</TableHead>
                </TableRow>
                <TableRow className="text-[10px] uppercase tracking-wider border-b border-blue-100">
                  {/* Pendapatan Columns */}
                  <TableHead className="text-right border-r border-blue-100 min-w-[120px] bg-blue-50 text-blue-700 font-semibold py-2">Bisyaroh Pokok</TableHead>
                  <TableHead className="text-right border-r border-blue-100 min-w-[120px] bg-blue-50 text-blue-700 font-semibold py-2">Kehadiran</TableHead>
                  <TableHead className="text-right border-r border-blue-100 min-w-[120px] bg-blue-50 text-blue-700 font-semibold py-2">Tunj. Jabatan</TableHead>
                  <TableHead className="text-right border-r border-blue-100 min-w-[120px] bg-blue-50 text-blue-700 font-semibold py-2">Tunj. Fungsional</TableHead>
                  <TableHead className="text-right border-r border-blue-100 min-w-[120px] bg-blue-50 text-blue-700 font-semibold py-2">Tunj. Keluarga</TableHead>
                  <TableHead className="text-right border-r border-blue-100 min-w-[120px] bg-blue-50 text-blue-700 font-semibold py-2">Tunj. Asrama</TableHead>
                  <TableHead className="text-right border-r border-blue-100 min-w-[120px] bg-blue-50 text-blue-700 font-semibold py-2">Tunj. Makan</TableHead>
                  <TableHead className="text-right border-r border-blue-100 min-w-[120px] bg-blue-50 text-blue-700 font-semibold py-2">Lain-lain</TableHead>
                  <TableHead className="text-right font-bold border-r border-blue-100 min-w-[130px] bg-blue-100 text-blue-900 py-2">Total</TableHead>

                  {/* Potongan Columns */}
                  <TableHead className="text-right border-r border-blue-100 min-w-[120px] bg-red-50 text-red-700 font-semibold py-2">Tunj. Keluarga</TableHead>
                  <TableHead className="text-right border-r border-blue-100 min-w-[120px] bg-red-50 text-red-700 font-semibold py-2">Tunj. Asrama</TableHead>
                  <TableHead className="text-right border-r border-blue-100 min-w-[120px] bg-red-50 text-red-700 font-semibold py-2">Tunj. Makan</TableHead>
                  <TableHead className="text-right border-r border-blue-100 min-w-[120px] bg-red-50 text-red-700 font-semibold py-2">Lain-lain</TableHead>
                  <TableHead className="text-right font-bold border-r border-blue-100 min-w-[130px] bg-red-100 text-red-900 py-2">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={19} className="text-center h-48 text-slate-400">
                       <div className="flex flex-col items-center justify-center gap-2">
                         <Search className="h-8 w-8 text-slate-300" />
                         <p>Tidak ada data ditemukan</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {filteredData.map((item, index) => (
                      <TableRow key={item.id} className="transition-colors group border-b border-blue-50 hover:bg-blue-50">
                        <TableCell className="border-r border-blue-50 text-center sticky left-0 bg-white group-hover:bg-blue-50 z-30 shadow-[1px_0_0_0_rgba(16,185,129,0.05)] font-medium text-slate-500">{index + 1}</TableCell>
                        <TableCell className="font-medium border-r border-blue-50 sticky left-[50px] bg-white group-hover:bg-blue-50 z-30 shadow-[1px_0_0_0_rgba(16,185,129,0.05)] text-blue-900">{item.name}</TableCell>
                        <TableCell className="border-r border-blue-50 text-slate-600 sticky left-[250px] bg-white group-hover:bg-blue-50 z-30 shadow-[2px_0_0_0_rgba(16,185,129,0.05)]">
                          <div className="flex flex-col">
                            <span>{item.position}</span>
                            <span className="text-[9px] text-slate-400 mt-0.5">{item.role}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right border-r border-blue-50 text-slate-600 bg-white group-hover:bg-blue-50">
                          <Input
                            type="number"
                            className="h-8 w-28 text-xs text-right border-blue-200 focus-visible:ring-blue-500"
                            value={String(item.bisyarohPokok)}
                            onChange={(e) =>
                              handleNumberChange(
                                item.id,
                                "bisyarohPokok",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right border-r border-blue-50 bg-white group-hover:bg-blue-50">
                          <div className="flex flex-col items-end gap-1">
                            {item.role === "educator" ? (
                              <Input
                                type="number"
                                className="h-8 w-28 text-xs text-right border-blue-200 focus-visible:ring-blue-500"
                                value={String(item.kehadiran)}
                                onChange={(e) =>
                                  handleNumberChange(
                                    item.id,
                                    "kehadiran",
                                    e.target.value
                                  )
                                }
                              />
                            ) : (
                              <span className="font-medium text-blue-700">
                                {formatCurrency(item.kehadiran)}
                              </span>
                            )}
                            <span className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full border border-slate-100">
                              {item.attendanceCount} kehadiran
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right border-r border-blue-50 text-slate-600 bg-white group-hover:bg-blue-50">{formatCurrency(item.tunjJabatan)}</TableCell>
                        <TableCell className="text-right border-r border-blue-50 text-slate-600 bg-white group-hover:bg-blue-50">{formatCurrency(item.tunjFungsional)}</TableCell>
                        <TableCell className="text-right border-r border-blue-50 text-slate-600 bg-white group-hover:bg-blue-50">{formatCurrency(item.tunjKeluarga)}</TableCell>
                        <TableCell className="text-right border-r border-blue-50 text-slate-600 bg-white group-hover:bg-blue-50">{formatCurrency(item.tunjAsrama)}</TableCell>
                        <TableCell className="text-right border-r border-blue-50 text-slate-600 bg-white group-hover:bg-blue-50">{formatCurrency(item.tunjMakanLaundry)}</TableCell>
                        <TableCell className="text-right border-r border-blue-50 bg-white group-hover:bg-blue-50">
                          <Input
                            type="number"
                            className="h-8 w-28 text-xs text-right border-blue-200 focus-visible:ring-blue-500"
                            value={String(item.lainLain)}
                            onChange={(e) =>
                              handleNumberChange(
                                item.id,
                                "lainLain",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right font-bold bg-blue-50 border-r border-blue-50 text-blue-800 group-hover:bg-blue-100">{formatCurrency(item.totalPendapatan)}</TableCell>

                        <TableCell className="text-right border-r border-blue-50 text-slate-600 bg-white group-hover:bg-blue-50">{formatCurrency(item.potTunjKeluarga)}</TableCell>
                        <TableCell className="text-right border-r border-blue-50 text-slate-600 bg-white group-hover:bg-blue-50">{formatCurrency(item.potTunjAsrama)}</TableCell>
                        <TableCell className="text-right border-r border-blue-50 text-slate-600 bg-white group-hover:bg-blue-50">{formatCurrency(item.potTunjMakanLaundry)}</TableCell>
                        <TableCell className="text-right border-r border-blue-50 text-slate-600 bg-white group-hover:bg-blue-50">{formatCurrency(item.potLainLain)}</TableCell>
                        <TableCell className="text-right font-bold bg-red-50 border-r border-blue-50 text-red-800 group-hover:bg-red-100">{formatCurrency(item.totalPotongan)}</TableCell>

                        <TableCell className="text-right font-bold bg-blue-100 border-b border-blue-50 text-blue-900 sticky right-0 z-30 shadow-[-2px_0_0_0_rgba(16,185,129,0.05)] group-hover:bg-blue-200">{formatCurrency(item.netBisyaroh)}</TableCell>
                      </TableRow>
                    ))}
                    {/* Summary Row */}
                    <TableRow className="bg-slate-50 font-bold sticky bottom-0 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t border-blue-200">
                       <TableCell colSpan={3} className="text-center border-r border-blue-200 sticky left-0 z-50 bg-slate-50 shadow-[2px_0_0_0_rgba(16,185,129,0.1)] text-blue-900 py-3">TOTAL KESELURUHAN</TableCell>
                       <TableCell className="text-right border-r border-blue-200 py-3 text-blue-800">{formatCurrency(filteredData.reduce((a, b) => a + b.bisyarohPokok, 0))}</TableCell>
                       <TableCell className="text-right border-r border-blue-200 py-3 text-blue-800">{formatCurrency(filteredData.reduce((a, b) => a + b.kehadiran, 0))}</TableCell>
                       <TableCell className="text-right border-r border-blue-200 py-3 text-blue-800">{formatCurrency(filteredData.reduce((a, b) => a + b.tunjJabatan, 0))}</TableCell>
                       <TableCell className="text-right border-r border-blue-200 py-3 text-blue-800">{formatCurrency(filteredData.reduce((a, b) => a + b.tunjFungsional, 0))}</TableCell>
                       <TableCell className="text-right border-r border-blue-200 py-3 text-blue-800">{formatCurrency(filteredData.reduce((a, b) => a + b.tunjKeluarga, 0))}</TableCell>
                       <TableCell className="text-right border-r border-blue-200 py-3 text-blue-800">{formatCurrency(filteredData.reduce((a, b) => a + b.tunjAsrama, 0))}</TableCell>
                       <TableCell className="text-right border-r border-blue-200 py-3 text-blue-800">{formatCurrency(filteredData.reduce((a, b) => a + b.tunjMakanLaundry, 0))}</TableCell>
                       <TableCell className="text-right border-r border-blue-200 py-3 text-blue-800">{formatCurrency(filteredData.reduce((a, b) => a + b.lainLain, 0))}</TableCell>
                       <TableCell className="text-right border-r border-blue-200 bg-blue-100 text-blue-900 py-3">{formatCurrency(filteredData.reduce((a, b) => a + b.totalPendapatan, 0))}</TableCell>
                       
                       <TableCell className="text-right border-r border-blue-200 py-3 text-red-800">{formatCurrency(filteredData.reduce((a, b) => a + b.potTunjKeluarga, 0))}</TableCell>
                       <TableCell className="text-right border-r border-blue-200 py-3 text-red-800">{formatCurrency(filteredData.reduce((a, b) => a + b.potTunjAsrama, 0))}</TableCell>
                       <TableCell className="text-right border-r border-blue-200 py-3 text-red-800">{formatCurrency(filteredData.reduce((a, b) => a + b.potTunjMakanLaundry, 0))}</TableCell>
                       <TableCell className="text-right border-r border-blue-200 py-3 text-red-800">{formatCurrency(filteredData.reduce((a, b) => a + b.potLainLain, 0))}</TableCell>
                       <TableCell className="text-right border-r border-blue-200 bg-red-100 text-red-900 py-3">{formatCurrency(filteredData.reduce((a, b) => a + b.totalPotongan, 0))}</TableCell>
                       
                       <TableCell className="text-right bg-blue-300 text-blue-950 sticky right-0 z-50 shadow-[-2px_0_0_0_rgba(16,185,129,0.1)] py-3 font-extrabold">{formatCurrency(filteredData.reduce((a, b) => a + b.netBisyaroh, 0))}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile: kartu ringkasan */}
        <div className="md:hidden mt-4 space-y-3">
          {filteredData.length === 0 ? (
            <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/60 py-10 px-4 text-center text-slate-500 text-sm">
              Tidak ada data ditemukan
            </div>
          ) : (
            filteredData.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-blue-100 bg-white shadow-sm p-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      {index + 1}. {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.position}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500">NET BISYAROH</p>
                    <p className="text-sm font-bold text-blue-700">
                      {formatCurrency(item.netBisyaroh)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-[11px]">
                  <p className="font-semibold text-blue-800">Pendapatan</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bisyaroh Pokok</span>
                      <span className="font-semibold text-blue-700">
                        {formatCurrency(item.bisyarohPokok)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Kehadiran</span>
                      <span className="font-semibold text-blue-700">
                        {formatCurrency(item.kehadiran)}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <span className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full border border-slate-100">
                        {item.attendanceCount} kehadiran
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tunj. Jabatan</span>
                      <span>{formatCurrency(item.tunjJabatan)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tunj. Fungsional</span>
                      <span>{formatCurrency(item.tunjFungsional)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tunj. Keluarga</span>
                      <span>{formatCurrency(item.tunjKeluarga)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tunj. Asrama</span>
                      <span>{formatCurrency(item.tunjAsrama)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tunj. Makan</span>
                      <span>{formatCurrency(item.tunjMakanLaundry)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lain-lain</span>
                      <span>{formatCurrency(item.lainLain)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Pendapatan</span>
                      <span className="font-semibold text-blue-700">
                        {formatCurrency(item.totalPendapatan)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-[11px]">
                  <p className="font-semibold text-red-700">Potongan</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tunj. Keluarga</span>
                      <span>{formatCurrency(item.potTunjKeluarga)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tunj. Asrama</span>
                      <span>{formatCurrency(item.potTunjAsrama)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tunj. Makan</span>
                      <span>{formatCurrency(item.potTunjMakanLaundry)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lain-lain</span>
                      <span>{formatCurrency(item.potLainLain)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 border-t border-blue-50 pt-2 text-[11px]">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-slate-500">Total Potongan</span>
                    <span className="font-semibold text-red-700">
                      {formatCurrency(item.totalPotongan)}
                    </span>
                  </div>
                </div>

                {item.role === "educator" ? (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <span className="block text-[11px] text-slate-500">Edit Bisyaroh Pokok</span>
                      <Input
                        type="number"
                        className="h-8 text-xs text-right border-blue-200 focus-visible:ring-blue-500"
                        value={String(item.bisyarohPokok)}
                        onChange={(e) =>
                          handleNumberChange(
                            item.id,
                            "bisyarohPokok",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[11px] text-slate-500">Edit Kehadiran</span>
                      <Input
                        type="number"
                        className="h-8 text-xs text-right border-blue-200 focus-visible:ring-blue-500"
                        value={String(item.kehadiran)}
                        onChange={(e) =>
                          handleNumberChange(
                            item.id,
                            "kehadiran",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[11px] text-slate-500">Edit Lain-lain</span>
                      <Input
                        type="number"
                        className="h-8 text-xs text-right border-blue-200 focus-visible:ring-blue-500"
                        value={String(item.lainLain)}
                        onChange={(e) =>
                          handleNumberChange(
                            item.id,
                            "lainLain",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="block text-[11px] text-slate-500">Edit Bisyaroh Pokok</span>
                      <Input
                        type="number"
                        className="h-8 text-xs text-right border-blue-200 focus-visible:ring-blue-500"
                        value={String(item.bisyarohPokok)}
                        onChange={(e) =>
                          handleNumberChange(
                            item.id,
                            "bisyarohPokok",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[11px] text-slate-500">Edit Lain-lain</span>
                      <Input
                        type="number"
                        className="h-8 text-xs text-right border-blue-200 focus-visible:ring-blue-500"
                        value={String(item.lainLain)}
                        onChange={(e) =>
                          handleNumberChange(
                            item.id,
                            "lainLain",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
