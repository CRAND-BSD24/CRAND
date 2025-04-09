"use client";

import { useEffect, useState } from "react";
import { getMemorizationHistory, type MemorizationHistory } from "./action";
import { useToast } from "@/components/ui/use-toast";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { id } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MemorizationPage = () => {
  const [historyData, setHistoryData] = useState<MemorizationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { toast } = useToast();

  const fetchHistoryData = async (startDate: Date, endDate: Date) => {
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
  };

  useEffect(() => {
    const startOfCurrentWeek = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(currentWeek, { weekStartsOn: 1 });
    fetchHistoryData(startOfCurrentWeek, endOfCurrentWeek);
  }, [currentWeek]);

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
    <div className="space-y-6 m-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Hafalan</h1>
          <p className="text-gray-600">
            Lihat riwayat hafalan Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousWeek}
            disabled={loading}
          >
            Minggu Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCurrentWeek}
            disabled={loading}
          >
            Minggu Ini
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            disabled={loading}
          >
            Minggu Berikutnya
          </Button>
        </div>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Riwayat Hafalan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-right text-sm text-gray-500 mb-4">
            {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "dd MMMM yyyy", { locale: id })} - 
            {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "dd MMMM yyyy", { locale: id })}
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : historyData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Tahun Angkatan</TableHead>
                    <TableHead>Juz</TableHead>
                    <TableHead>Halaman</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.created_at), "dd MMMM yyyy", { locale: id })}
                      </TableCell>
                      <TableCell>{record.semester}</TableCell>
                      <TableCell>{record.academic_year}</TableCell>
                      <TableCell>{record.juz_name}</TableCell>
                      <TableCell>{record.pages}</TableCell>
                      <TableCell>{record.status}</TableCell>
                      <TableCell>{record.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex justify-center items-center h-32 text-gray-500">
                Tidak ada setoran hafalan di minggu ini
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemorizationPage;
