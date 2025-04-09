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
    <div className="min-h-screen bg-gradient-to-b from-[#9ACBD0] to-[#006A71] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto transform hover:scale-[1.01] transition-transform duration-300">
        <div className="bg-white backdrop-blur-lg bg-opacity-95 rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <div className="border-b border-gray-200 pb-8">
              <h1 className="text-4xl font-extrabold text-[#006A71] text-center tracking-tight">
                Nilai Akademik Santri
              </h1>
            </div>

            {academic ? (
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="bg-[#F0F9FA] rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                    <p className="text-sm font-medium text-gray-500 mb-1">Nama Santri</p>
                    <p className="text-lg font-semibold text-[#006A71]">{academic.student_info?.name}</p>
                  </div>
                  <div className="bg-[#F0F9FA] rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                    <p className="text-sm font-medium text-gray-500 mb-1">Semester</p>
                    <p className="text-lg font-semibold text-[#006A71]">{academic.semester}</p>
                  </div>
                  <div className="bg-[#F0F9FA] rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                    <p className="text-sm font-medium text-gray-500 mb-1">Tahun Ajaran</p>
                    <p className="text-lg font-semibold text-[#006A71]">{academic.academic_year}</p>
                  </div>
                  <div className="bg-[#F0F9FA] rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                    <p className="text-sm font-medium text-gray-500 mb-1">Nilai</p>
                    <p className="text-lg font-semibold text-[#006A71]">{academic.score}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 text-center">
                    Terakhir diperbarui: {new Date(academic.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center py-12">
                <p className="text-lg text-[#006A71] italic">
                  Data nilai belum tersedia.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicPage;
