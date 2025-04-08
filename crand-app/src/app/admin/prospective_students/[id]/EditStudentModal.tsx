"use client";

import { useState } from "react";
import { updateStudentById } from "./action";
import { useRouter } from "next/navigation";

interface Student {
  _id: string;
  profile_picture?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  program?: string;
  gender?: string;
  address?: string;
  level?: string;
  academic_year?: string;
  birth_place_date?: string;
  payment_status?: string;
}

export default function EditStudentModal({ student }: { student: Student }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    profile_picture: student.profile_picture || "",
    name: student.name || "",
    email: student.email || "",
    phone_number: student.phone_number || "",
    program: student.program || "",
    gender: student.gender || "",
    address: student.address || "",
    level: student.level || "",
    academic_year: student.academic_year || "",
    birth_place_date: student.birth_place_date || "",
    payment_status: student.payment_status || "",
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
          <div className="bg-gray-100 p-6 rounded-lg w-full max-w-lg space-y-4 shadow-xl shadow-black">
            <h2 className="text-xl font-semibold mb-4">Edit Data Santri</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="profile_picture"
                value={form.profile_picture}
                onChange={handleChange}
                placeholder="URL Foto Profil"
                className="w-full border p-2 rounded"
              />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama"
                className="w-full border p-2 rounded"
              />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border p-2 rounded"
              />
              <input
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="Nomor HP"
                className="w-full border p-2 rounded"
              />
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Alamat"
                className="w-full border p-2 rounded"
              />
              <input
                name="program"
                value={form.program}
                onChange={handleChange}
                placeholder="Program"
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
                name="level"
                value={form.level}
                onChange={handleChange}
                placeholder="Level"
                className="w-full border p-2 rounded"
              />
              <input
                name="academic_year"
                value={form.academic_year}
                onChange={handleChange}
                placeholder="Tahun Ajaran"
                className="w-full border p-2 rounded"
              />
              <input
                name="birth_place_date"
                value={form.birth_place_date}
                onChange={handleChange}
                placeholder="Tempat, Tanggal Lahir"
                className="w-full border p-2 rounded"
              />
              <select
                name="payment_status"
                value={form.payment_status}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Status Pembayaran</option>
                <option value="Lunas">Lunas</option>
                <option value="Belum Lunas">Belum Lunas</option>
              </select>

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
