"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAllTeachersForMemorize,
  getWeeklyMemorizationByTeacher,
  type TeacherItem,
  type MemorizationStudent,
} from "./action";
import { BookOpen, Users, Search } from "lucide-react";
import { toast } from "sonner";

const ManagerMemorizePage = () => {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [students, setStudents] = useState<MemorizationStudent[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());

  const getWeekStartEnd = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun, 1=Mon ...
    const diffToMonday = (day + 6) % 7; // days back to Monday
    const start = new Date(d);
    start.setDate(d.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const formatWeekRange = (date: Date) => {
    const { start, end } = getWeekStartEnd(date);
    const startStr = start.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
    const endStr = end.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    return `${startStr} - ${endStr}`;
  };

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoadingTeachers(true);
        const list = await getAllTeachersForMemorize();
        setTeachers(list);
        if (list.length > 0) setSelectedTeacherId(list[0].id);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat daftar ustadz");
      } finally {
        setLoadingTeachers(false);
      }
    };
    loadTeachers();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedTeacherId) return;
      try {
        setLoadingStudents(true);
        const { start, end } = getWeekStartEnd(currentWeek);
        const list = await getWeeklyMemorizationByTeacher(selectedTeacherId, start, end);
        setStudents(list);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat data hafalan");
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, [selectedTeacherId, currentWeek]);


  const gotoPrevWeek = () => {
    setCurrentWeek((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() - 7);
      return nd;
    });
  };
  const gotoNextWeek = () => {
    setCurrentWeek((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + 7);
      return nd;
    });
  };

  const filteredTeachers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return teachers;
    return teachers.filter((t) => (t.name || "").toLowerCase().includes(term));
  }, [teachers, searchTerm]);

  return (
    <div className="min-h-screen p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Ustadz */}
        <aside className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 shadow-md p-4 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-emerald-700" />
            <h2 className="text-lg font-semibold text-emerald-900">Hafalan</h2>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-emerald-700" />
            <input
              type="text"
              placeholder="Cari ustadz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="space-y-1 max-h-[50vh] overflow-y-auto">
            {loadingTeachers ? (
              <div className="text-sm text-emerald-700">Memuat ustadz...</div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-sm text-emerald-700">Tidak ada ustadz</div>
            ) : (
              filteredTeachers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeacherId(t.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    selectedTeacherId === t.id
                      ? "bg-emerald-100 text-emerald-900"
                      : "hover:bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {t.name}
                  <div className="text-xs text-emerald-600">{t.email}</div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Konten: Santri dan Hafalan */}
        <section className="lg:col-span-3">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 shadow-md">
            <div className="flex items-center justify-between p-4 border-b border-white/40">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-semibold text-emerald-900">
                  Santri & Hafalan
                </h3>
              </div>
              <div className="flex items-center gap-4">
                {selectedTeacherId && (
                  <span className="text-sm text-emerald-700">
                    Ustadz: {teachers.find((t) => t.id === selectedTeacherId)?.name}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <button onClick={gotoPrevWeek} className="px-2 py-1 text-sm bg-emerald-100 text-emerald-800 rounded">Minggu -</button>
                  <span className="text-sm text-emerald-800">{formatWeekRange(currentWeek)}</span>
                  <button onClick={gotoNextWeek} className="px-2 py-1 text-sm bg-emerald-100 text-emerald-800 rounded">Minggu +</button>
                </div>
              </div>
            </div>

            <div className="p-4 overflow-x-auto">
              {loadingStudents ? (
                <div className="text-emerald-700">Memuat data santri...</div>
              ) : students.length === 0 ? (
                <div className="text-emerald-700">Belum ada data hafalan</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-50 text-emerald-800">
                      <th className="px-3 py-2 text-left">Nama Santri</th>
                      <th className="px-3 py-2 text-left">Halaqah</th>
                      <th className="px-3 py-2 text-left">Kelas</th>
                      <th className="px-3 py-2 text-left">Total Minggu Ini</th>
                      <th className="px-3 py-2 text-left">Juz</th>
                      <th className="px-3 py-2 text-left">Surat</th>
                      <th className="px-3 py-2 text-left">Halaman</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Catatan</th>
                      <th className="px-3 py-2 text-left">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="border-b border-emerald-100">
                        <td className="px-3 py-2 font-medium text-emerald-900">{s.name}</td>
                        <td className="px-3 py-2 text-emerald-800">{s.halaqah_name || "-"}</td>
                        <td className="px-3 py-2 text-emerald-800">{s.class_name || "-"}</td>
                        <td className="px-3 py-2 font-semibold text-emerald-900">{s.weekly_total_pages ?? 0} halaman</td>
                        <td className="px-3 py-2">{s.juz_name || "-"}</td>
                        <td className="px-3 py-2">{s.surah || "-"}</td>
                        <td className="px-3 py-2">{s.pages || "-"}</td>
                        <td className="px-3 py-2">{s.status || "-"}</td>
                        <td className="px-3 py-2">{s.notes || "-"}</td>
                        <td className="px-3 py-2">{s.created_at ? new Date(s.created_at).toLocaleDateString("id-ID") : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </section>
      </div>
    </div>
  );
};

export default ManagerMemorizePage;