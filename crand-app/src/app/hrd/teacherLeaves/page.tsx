"use client";

import { useEffect, useState } from "react";
import { getTeacherLeaveRequests, updateTeacherLeaveStatus, TeacherLeaveRequestItem } from "./action";
import { toast } from "sonner";

export default function TeacherLeavesPage() {
  const [items, setItems] = useState<TeacherLeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getTeacherLeaveRequests();
      setItems(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat ajuan perizinan ustadz.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      setUpdatingId(id);
      await updateTeacherLeaveStatus(id, status);
      toast.success(status === "approved" ? "Perizinan disetujui." : "Perizinan ditolak.");
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui status perizinan.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-4 sm:p-8 border-t-4 border-blue-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">
              Ajuan Perizinan Pegawai
            </h1>
            <p className="text-blue-700 mt-1 text-sm">
              Lihat dan setujui atau tolak ajuan perizinan dari semua role (staff, admin, manager, guru, educator).
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-blue-700 text-sm">
            Memuat data ajuan perizinan...
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-blue-700 text-sm">
            Belum ada ajuan perizinan.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="min-w-full divide-y divide-blue-100 text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Nama</th>
                  <th className="px-3 py-2 text-left font-semibold">Tanggal</th>
                  <th className="px-3 py-2 text-left font-semibold">Waktu Mengajar</th>
                  <th className="px-3 py-2 text-left font-semibold">Alasan</th>
                  <th className="px-3 py-2 text-center font-semibold">Status</th>
                  <th className="px-3 py-2 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-blue-50/60">
                    <td className="px-3 py-2 whitespace-nowrap text-blue-900">
                      {item.teacher_name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-blue-900">
                      {item.date}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-blue-900">
                      {item.slot_label}
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      <div className="text-blue-900 line-clamp-3">{item.reason}</div>
                    </td>
                    <td className="px-3 py-2 text-center">
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
                          : "Menunggu"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item._id, "approved")}
                          disabled={updatingId === item._id}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          Setujui
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item._id, "rejected")}
                          disabled={updatingId === item._id}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
