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
  quran_memorization?: {
    surah: string;
    start_verse: number;
    end_verse: number;
  };
  student_info?: {
    name: string;
    class_id: string;
    academic_level: string;
  };
}

const MemorizationPage = () => {
  const [memorization, setMemorization] = useState<MemorizationData | null>(null);

  const fetchMemorizationData = async () => {
    try {
      const data = await getMemorizationByStudentId();
      if (data) {
        setMemorization(data);
      } else {
        setMemorization(null);
      }
    } catch (error) {
      console.error("Gagal mengambil data hafalan:", error);
    }
  };

  useEffect(() => {
    fetchMemorizationData();
  }, []);

  return (
    <div className="p-8 bg-[#9ACBD0] min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-12">
        <h1 className="text-3xl font-bold text-[#006A71] mb-6 text-center">
          Data Hafalan Santri
        </h1>

        {memorization ? (
          <div className="space-y-4 text-[#006A71]">
            <p><strong>Nama:</strong> {memorization.student_info?.name}</p>
            <p><strong>Kelas:</strong> {memorization.student_info?.class_id}</p>
            <p><strong>Tingkat:</strong> {memorization.student_info?.academic_level}</p>
            <p><strong>Semester:</strong> {memorization.semester}</p>
            <p><strong>Tahun Ajaran:</strong> {memorization.academic_year}</p>
            <p><strong>Surah:</strong> {memorization.quran_memorization?.surah}</p>
            <p><strong>Ayat:</strong> {memorization.quran_memorization?.start_verse} - {memorization.quran_memorization?.end_verse}</p>
            <p><strong>Halaman:</strong> {memorization.pages}</p>
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
