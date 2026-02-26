"use client";

import { useEffect, useState } from "react";
import { getTeacherLeavesForCurrentUser, TeacherLeaveForTeacher } from "@/app/teacher/leaves/teacherLeavesAction";
import { toast } from "sonner";

export default function EducatorLeavesPage() {
  const [items, setItems] = useState<TeacherLeaveForTeacher[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getTeacherLeavesForCurrentUser();
      setItems(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat riwayat perizinan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-4 sm:p-8 border-t-4 border-blue-800">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">
            Riwayat Perizinan
          </h1>
          <p className="text-blue-700 mt-1 text-sm">
            Lihat status ajuan perizinan tidak masuk yang sudah diajukan.
          </p>
        </div>

        {loading ? (
          <div className="py-8 text-center text-blue-700 text-sm">
            Memuat riwayat perizinan...
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-blue-700 text-sm">
            Belum ada ajuan perizinan.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="border border-blue-100 rounded-xl p-3 sm:p-4 bg-blue-50/50"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-blue-900">
                      {item.date} • {item.slot_label}
                    </div>
                    <div className="mt-1 text-xs text-blue-800">
                      Alasan: {item.reason}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={
                        item.status === "approved"
                          ? "inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"
                          : item.status === "rejected"
                          ? "inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"
                          : "inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800"
                      }
                    >
                      {item.status === "approved"
                        ? "Disetujui"
                        : item.status === "rejected"
                        ? "Ditolak"
                        : "Menunggu persetujuan"}
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

