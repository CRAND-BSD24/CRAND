"use client";

import React, { useEffect, useState } from "react";
import { getAllTeachers } from "./action";
import Link from "next/link";
import AddTeacherModal from "./AddTeacherModal";

interface Teacher {
  _id: string;
  nip: string;
  user: {
    name: string;
  };
}

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");

  const fetchTeachers = async () => {
    const response = await getAllTeachers();
    const data = JSON.parse(response);
    setTeachers(data);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter((teacher) =>
    search.trim() === ""
      ? true
      : teacher?.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#9ACBD0] min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-12">
        <h1 className="text-3xl font-bold text-[#006A71] mb-8 text-center">
          Manajemen Data Ustadz
        </h1>

        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Cari nama ustadz..."
            className="border px-4 py-2 rounded-md w-1/2 focus:outline-none focus:ring-2 focus:ring-[#48A6A7]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <AddTeacherModal onTeacherAdded={fetchTeachers} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-[#48A6A7] text-white">
                <th className="px-4 py-3 rounded-l-md">#</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">NIP</th>
                <th className="px-4 py-3 rounded-r-md">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher, index) => (
                <tr
                  key={teacher._id}
                  className="bg-[#f9fdfd] hover:bg-[#e0f4f4] transition-colors rounded-md shadow-sm"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{teacher.user?.name || "-"}</td>
                  <td className="px-4 py-3">{teacher.nip}</td>
                  <td className="px-4 py-3 space-x-2">
                    <Link
                      href={`/admin/teachers/${teacher._id}`}
                      className="text-[#006A71] font-semibold hover:underline"
                    >
                      Detail
                    </Link>
                    <button
                      onClick={() => alert("Fitur edit akan ditambahkan")}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-6 text-[#006A71] italic bg-[#f0fafa] rounded-md"
                  >
                    Tidak ada data ustadz.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeachersPage;
