"use client";

import { useState } from "react";
import { updateStudentById } from "./action";
import { useRouter } from "next/navigation";

export default function EditStudentModal({ student }: { student: any }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: student.name || "",
    class: student.class || "",
    academic_level: student.academic_level || "",
    gender: student.gender || "",
    parent_name: student.parent_name || "",
    batch_year: student.batch_year || "",
    birth_date: student.birth_date ? new Date(student.birth_date).toISOString().split("T")[0] : "",
    birth_place: student.birth_place || "",
    address: student.address || "",
    phone_number: student.phone_number || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateStudentById(student._id, form);

    if (success) {
      alert("Data berhasil diperbarui.");
      setIsOpen(false);
      router.refresh();
    } else {
      alert("Gagal memperbarui data.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg space-y-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-[#006A71]">Edit Data Santri</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama Lengkap"
                className="w-full border p-2 rounded"
              />
              <input
                name="class"
                value={form.class}
                onChange={handleChange}
                placeholder="Kelas (misal: 1A)"
                className="w-full border p-2 rounded"
              />
              <input
                name="academic_level"
                value={form.academic_level}
                onChange={handleChange}
                placeholder="Tingkat Akademik (misal: Ibtidaiyah)"
                className="w-full border p-2 rounded"
              />
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              <input
                name="parent_name"
                value={form.parent_name}
                onChange={handleChange}
                placeholder="Nama Orang Tua"
                className="w-full border p-2 rounded"
              />
              <input
                name="batch_year"
                value={form.batch_year}
                onChange={handleChange}
                placeholder="Tahun Angkatan (misal: 2024)"
                className="w-full border p-2 rounded"
              />
              <input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <input
                name="birth_place"
                value={form.birth_place}
                onChange={handleChange}
                placeholder="Tempat Lahir"
                className="w-full border p-2 rounded"
              />
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Alamat Lengkap"
                className="w-full border p-2 rounded"
              />
              <input
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="Nomor HP"
                className="w-full border p-2 rounded"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
