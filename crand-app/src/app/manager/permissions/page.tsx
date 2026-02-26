"use client";

import { useEffect, useState } from "react";
import { getManagerLeaveRequests } from "../attendance/action";
import { toast } from "sonner";
import ManagerLeaveModal from "@/components/ManagerLeaveModal";

interface ManagerLeaveRequest {
  _id: string;
  startDate: string | Date;
  endDate: string | Date;
  type: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string | Date;
}

export default function ManagerPermissionsPage() {
  const [items, setItems] = useState<ManagerLeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const fetchData = async (selectedMonth: number, selectedYear: number) => {
    try {
      setLoading(true);
      const data = await getManagerLeaveRequests(selectedMonth, selectedYear);
      setItems(data as any);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat riwayat perizinan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(month, year);
  }, [month, year]);

  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  const years = Array.from({ length: 6 }, (_, i) => 2023 + i);

  const formatDate = (date: string | Date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 sm:p-8 pt-20 lg:pt-8">
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-4 sm:p-8 border-t-4 border-blue-800">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">
              Riwayat Perizinan
            </h1>
            <p className="text-blue-700 mt-1 text-sm">
              Lihat status ajuan perizinan tidak masuk yang sudah diajukan.
            </p>
          </div>
          <ManagerLeaveModal />
        </div>

        <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="text-sm text-blue-700">
            Menampilkan riwayat perizinan bulan{" "}
            <span className="font-semibold">
              {months.find((m) => m.value === month)?.label}
            </span>{" "}
            {year}
          </div>
          <div className="flex gap-2">
            <select
              className="border border-blue-200 rounded-lg px-3 py-1.5 text-sm text-blue-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              className="border border-blue-200 rounded-lg px-3 py-1.5 text-sm text-blue-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-blue-700 text-sm">
            Memuat riwayat perizinan...
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-blue-700 text-sm bg-blue-50/50 rounded-xl border border-dashed border-blue-200">
            Belum ada ajuan perizinan pada periode ini.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="border border-blue-100 rounded-xl p-3 sm:p-4 bg-blue-50/50 hover:bg-blue-50 transition-colors"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                      <span>{formatDate(item.startDate)}</span>
                      {item.startDate !== item.endDate && (
                        <>
                          <span className="text-blue-400">→</span>
                          <span>{formatDate(item.endDate)}</span>
                        </>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-normal">
                        {item.type}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-blue-800">
                      Alasan: {item.reason}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={
                        item.status === "approved"
                          ? "inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"
                          : item.status === "rejected"
                          ? "inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"
                          : "inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800"
                      }
                    >
                      {item.status === "approved"
                        ? "Disetujui"
                        : item.status === "rejected"
                        ? "Ditolak"
                        : "Menunggu"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
