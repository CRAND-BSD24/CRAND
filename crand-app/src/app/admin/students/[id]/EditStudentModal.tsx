"use client";

import { useState } from "react";
import { updateStudentById } from "./action";
import { useRouter } from "next/navigation";

interface Student {
  _id: string;
  name: string;
  class: string;
  academic_level: string;
  gender: string;
  parent_name: string;
  batch_year: number;
  birth_date: string;
  birth_place: string;
  address: string;
  phone_number: string;
  profile_picture?: string;
}

export default function EditStudentModal({ student }: { student: Student }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    name: student.name || "",
    class: student.class || "",
    academic_level: student.academic_level || "",
    gender: student.gender || "",
    parent_name: student.parent_name || "",
    batch_year: student.batch_year?.toString() || "",
    birth_date: student.birth_date
      ? new Date(student.birth_date).toISOString().split("T")[0]
      : "",
    birth_place: student.birth_place || "",
    address: student.address || "",
    phone_number: student.phone_number || "",
    profile_picture: student.profile_picture || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.class || !form.gender) {
      alert("Harap lengkapi nama, kelas, dan jenis kelamin.");
      return;
    }

    const updatedForm = {
      ...form,
      batch_year: Number(form.batch_year),
    };

    const success = await updateStudentById(student._id, updatedForm);

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
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl space-y-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-2 text-[#006A71]">Edit Data Santri</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Nama Lengkap", name: "name" },
                { label: "Kelas (misal: 1A)", name: "class" },
                { label: "Tingkat Akademik", name: "academic_level" },
                { label: "Nama Orang Tua", name: "parent_name" },
                { label: "Tahun Angkatan", name: "batch_year", type: "number" },
                { label: "Tempat Lahir", name: "birth_place" },
                { label: "Alamat Lengkap", name: "address" },
                { label: "Nomor HP", name: "phone_number" },
                { label: "URL Foto Profil", name: "profile_picture" },
              ].map(({ label, name, type = "text" }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700">{label}</label>
                  <input
                    name={name}
                    type={type}
                    value={(form as any)[name]}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                <input
                  type="date"
                  name="birth_date"
                  value={form.birth_date}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-2 pt-2">
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
