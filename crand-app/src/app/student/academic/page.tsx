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
    <div className="p-8 bg-[#9ACBD0] min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-12">
        <h1 className="text-3xl font-bold text-[#006A71] mb-6 text-center">
          Nilai Akademik Santri
        </h1>

        {academics.length > 0 ? (
          <div className="space-y-4 text-[#006A71]">
            {academics.map((academic) => (
              <div
                key={academic._id}
                className="bg-white shadow-md rounded-lg overflow-hidden"
              >
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">
                    {academic.student_info?.name}
                  </h2>
                  <table className="min-w-full bg-white">
                    <tbody>
                      <tr>
                        <td className="py-2 px-4 font-medium">Semester:</td>
                        <td className="py-2 px-4">{academic.semester}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="py-2 px-4 font-medium">Tahun Ajaran:</td>
                        <td className="py-2 px-4">{academic.academic_year}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-medium">Nilai:</td>
                        <td className="py-2 px-4">{academic.score}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="py-2 px-4 font-medium">Diperbarui:</td>
                        <td className="py-2 px-4">
                          {new Date(academic.updated_at).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
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
