"use client";

import { useEffect, useState } from "react";
import { getAcademicByStudentId } from "./action";

interface AcademicData {
  _id: string;
  student_id: string;
  subject_id: string;
  semester: string;
  academic_year: string;
  score: number;
  created_at: string;
  updated_at: string;
  student_info?: {
    name: string;
    class_id: string;
    academic_level: string;
  };
}

const AcademicPage = () => {
  const [academic, setAcademic] = useState<AcademicData | null>(null);

  const fetchAcademicData = async () => {
    try {
      const data = await getAcademicByStudentId();
      console.log(data, '<<< ini data dari akademik student');

      if (data) {
        setAcademic(data);
      } else {
        setAcademic(null);
      }
    } catch (error) {
      console.error("Gagal mengambil data akademik:", error);
    }
  };

  useEffect(() => {
    fetchAcademicData();
  }, []);

  return (
    <div className="p-8 bg-[#9ACBD0] min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-12">
        <h1 className="text-3xl font-bold text-[#006A71] mb-6 text-center">
          Nilai Akademik Santri
        </h1>

        {academic ? (
          <div className="space-y-4 text-[#006A71]">
            <p><strong>Nama:</strong> {academic.student_info?.name}</p>
            <p><strong>Semester:</strong> {academic.semester}</p>
            <p><strong>Tahun Ajaran:</strong> {academic.academic_year}</p>
            <p><strong>Nilai:</strong> {academic.score}</p>
            <p className="text-sm text-gray-600">
              Diperbarui: {new Date(academic.updated_at).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-center text-[#006A71] italic">
            Data nilai belum tersedia.
          </p>
        )}
      </div>
    </div>
  );
};

export default AcademicPage;
