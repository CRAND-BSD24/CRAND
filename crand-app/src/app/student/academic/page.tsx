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
  subject_info?: {
    name: string;
  };
}

const AcademicPage = () => {
  const [academics, setAcademics] = useState<AcademicData[]>([]);

  const fetchAcademicData = async () => {
    try {
      const data = await getAcademicByStudentId();
      console.log(data, "<<< ini data dari akademik student");

      if (data) {
        setAcademics(data);
      } else {
        setAcademics([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data akademik:", error);
    }
  };

  useEffect(() => {
    fetchAcademicData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#e0e0e0] to-[#e6e6e6] p-6 space-y-8">
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <h1 className="text-3xl font-bold text-black mb-2">Nilai Akademik</h1>
        <p className="text-black">
          Pantau perkembangan nilai akademik Anda di sini.
        </p>
      </div>

        <div className="mt-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              {academics.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/10 bg-black/5">
                      <th className="text-left py-4 px-6 font-semibold text-black">Mata Pelajaran</th>
                      <th className="text-left py-4 px-6 font-semibold text-black">Semester</th>
                      <th className="text-left py-4 px-6 font-semibold text-black">Tahun Ajaran</th>
                      <th className="text-left py-4 px-6 font-semibold text-black">Nilai</th>
                      <th className="text-left py-4 px-6 font-semibold text-black">Terakhir Diperbarui</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {academics.map((academic) => (
                      <tr 
                        key={academic._id}
                        className="hover:bg-black/5 transition-colors"
                      >
                        <td className="py-4 px-6 font-medium text-black">
                          {academic.subject_info?.name}
                        </td>
                        <td className="py-4 px-6 text-black">
                          {academic.semester}
                        </td>
                        <td className="py-4 px-6 text-black">
                          {academic.academic_year}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-black/10 rounded-full font-medium text-black">
                            {academic.score}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-black">
                          {new Date(academic.updated_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-black/60 italic">
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