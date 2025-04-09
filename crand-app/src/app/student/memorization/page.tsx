"use client";

import { useEffect, useState, useCallback } from "react";
import { getMemorizationHistory, type MemorizationHistory } from "./action";
import { useToast } from "@/components/ui/use-toast";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const MemorizationPage = () => {
  const [historyData, setHistoryData] = useState<MemorizationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { toast } = useToast();

  const fetchHistoryData = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      const history = await getMemorizationHistory(startDate, endDate);
      setHistoryData(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat riwayat hafalan",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const startOfCurrentWeek = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(currentWeek, { weekStartsOn: 1 });
    fetchHistoryData(startOfCurrentWeek, endOfCurrentWeek);
  }, [currentWeek, fetchHistoryData]);

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#e0e0e0] to-[#e6e6e6] p-6 space-y-8">
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <h1 className="text-3xl font-bold text-black mb-2">Riwayat Hafalan</h1>
        <p className="text-black">
          Pantau perkembangan hafalan Anda di sini.
        </p>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button
          className="bg-white/70 hover:bg-white/90 text-black border border-white/20"
          size="sm"
          onClick={handlePreviousWeek}
          disabled={loading}
        >
          Minggu Sebelumnya
        </Button>
        <Button
          className="bg-white/70 hover:bg-white/90 text-black border border-white/20"
          size="sm"
          onClick={handleCurrentWeek}
          disabled={loading}
        >
          Minggu Ini
        </Button>
        <Button
          className="bg-white/70 hover:bg-white/90 text-black border border-white/20"
          size="sm"
          onClick={handleNextWeek}
          disabled={loading}
        >
          Minggu Berikutnya
        </Button>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-md overflow-hidden">
        <div className="p-4 border-b border-black/5 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-black">Periode:</h2>
          <p className="text-black">
            {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "dd MMMM yyyy", { locale: id })} - 
            {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "dd MMMM yyyy", { locale: id })}
          </p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : historyData.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 bg-black/5">
                  <th className="text-left py-4 px-6 font-semibold text-black">Tanggal</th>
                  <th className="text-left py-4 px-6 font-semibold text-black">Semester</th>
                  <th className="text-left py-4 px-6 font-semibold text-black">Tahun Angkatan</th>
                  <th className="text-left py-4 px-6 font-semibold text-black">Juz</th>
                  <th className="text-left py-4 px-6 font-semibold text-black">Halaman</th>
                  <th className="text-left py-4 px-6 font-semibold text-black">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-black">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {historyData.map((record) => (
                  <tr 
                    key={record.id}
                    className="hover:bg-black/5 transition-colors"
                  >
                    <td className="py-4 px-6 text-black">
                      {format(new Date(record.created_at), "dd MMMM yyyy", { locale: id })}
                    </td>
                    <td className="py-4 px-6 text-black">{record.semester}</td>
                    <td className="py-4 px-6 text-black">{record.academic_year}</td>
                    <td className="py-4 px-6 text-black">{record.juz_name}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-black/10 rounded-full font-medium text-black">
                        {record.pages}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-black">{record.status}</td>
                    <td className="py-4 px-6 text-black">{record.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-black/60 italic">
                Tidak ada setoran hafalan di minggu ini
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemorizationPage;
