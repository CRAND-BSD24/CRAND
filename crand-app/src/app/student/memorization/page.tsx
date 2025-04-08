"use client";

import { useEffect, useState } from "react";
import { getMemorizationByStudentId } from "./action";

interface MemorizationData {
  _id: string;
  semester: string;
  academic_year: string;
  pages: number;
  notes: string;
  status: string;
  updated_at: string;
  student_info?: {
    name: string;
  };
  quran_memorization_info?: {
    name: string;
  };
}

const MemorizationPage = () => {
  const [memorization, setMemorization] = useState<MemorizationData | null>(null);

  const fetchMemorizationData = async () => {
    try {
      const data = await getMemorizationByStudentId();
      console.log(data, '<<< data dari memorization');
      setMemorization(data);
    } catch (error) {
      console.error("Gagal mengambil data tahfidz:", error);
    }
  };

  useEffect(() => {
    fetchMemorizationData();
  }, []);

  return (
    <div className="p-8 bg-[#9ACBD0] min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-12">
        <h1 className="text-3xl font-bold text-[#006A71] mb-6 text-center">
          Nilai Hafalan Quran Santri
        </h1>

        {memorization ? (
          <div className="space-y-4 text-[#006A71]">
            <p><strong>Nama:</strong> {memorization.student_info?.name}</p>
            <p><strong>Juz:</strong> {memorization.quran_memorization_info?.name}</p>
            <p><strong>Semester:</strong> {memorization.semester}</p>
            <p><strong>Tahun Ajaran:</strong> {memorization.academic_year}</p>
            <p><strong>Jumlah Halaman:</strong> {memorization.pages}</p>
            <p><strong>Catatan:</strong> {memorization.notes}</p>
            <p><strong>Status:</strong> {memorization.status}</p>
            <p className="text-sm text-gray-600">
              Diperbarui: {new Date(memorization.updated_at).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-center text-[#006A71] italic">
            Data hafalan belum tersedia.
          </p>
        )}
      </div>
    </div>
  );
};

export default MemorizationPage;
