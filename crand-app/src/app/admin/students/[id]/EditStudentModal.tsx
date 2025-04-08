"use client";

import { Student } from "@/types/student";
import { useState, useEffect } from "react";
import { updateStudentById } from "./action";
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  email: string;
  address: string;
  father_name: string;
  mother_name: string;
  gender: string;
  nisn: string;
  academic_year: string;
  program: string;
  level: string;
  ekskul: string;
  graduation_status: string;
  phone_number: string;
  payment_status: string;
  VA_SPP: string;
  birth_place_date: string;
  profile_picture: string;
  class_id: string;
  halaqah_id: string;
}

interface EditStudentModalProps {
  student: Student;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditStudentModal({ student, onClose, onUpdated }: EditStudentModalProps) {
  const router = useRouter();

  // Initialize all states with proper default values
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    address: "",
    father_name: "",
    mother_name: "",
    gender: "",
    nisn: "",
    academic_year: "",
    program: "",
    level: "",
    ekskul: "",
    graduation_status: "",
    phone_number: "",
    payment_status: "",
    VA_SPP: "",
    birth_place_date: "",
    profile_picture: "",
    class_id: "",
    halaqah_id: "",
  });

  // Set initial form data when student prop is available
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        address: student.address || "",
        father_name: student.father_name || "",
        mother_name: student.mother_name || "",
        gender: student.gender || "",
        nisn: student.nisn || "",
        academic_year: student.academic_year || "",
        program: student.program || "",
        level: student.level || "",
        ekskul: student.ekskul || "",
        graduation_status: student.graduation_status || "",
        phone_number: student.phone_number || "",
        payment_status: student.payment_status || "",
        VA_SPP: student.VA_SPP || "",
        birth_place_date: student.birth_place_date || "",
        profile_picture: student.profile_picture || "",
        class_id: student.class_id || "",
        halaqah_id: student.halaqah_id || "",
      });
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData = {
      name: formData.name,
      class_id: formData.class_id || null,
      academic_level: student.academic_level,
      gender: formData.gender,
      father_name: formData.father_name,
      mother_name: formData.mother_name,
      academic_year: formData.academic_year,
      birth_place_date: formData.birth_place_date,
      address: formData.address,
      graduation_status: formData.graduation_status,
      payment_status: formData.payment_status,
      VA_SPP: formData.VA_SPP,
      ekskul: formData.ekskul,
      level: formData.level,
      nisn: formData.nisn,
      program: formData.program,
      halaqah_id: formData.halaqah_id || null,
      profile_picture: formData.profile_picture,
      email: formData.email,
      phone_number: formData.phone_number,
    };

    try {
      const success = await updateStudentById(student._id, updatedData);
      if (success) {
        onUpdated();
        onClose();
      } else {
        alert("Gagal mengupdate data");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Terjadi kesalahan saat mengupdate data");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-h-[90vh] overflow-y-auto w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Edit Data Santri</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Nama</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">No. HP</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Alamat</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Tempat, Tanggal Lahir</label>
              <input
                type="text"
                name="birth_place_date"
                value={formData.birth_place_date}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Nama Ayah</label>
              <input
                type="text"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Nama Ibu</label>
              <input
                type="text"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Jenis Kelamin</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Pilih</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          <hr className="my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">NISN</label>
              <input
                type="text"
                name="nisn"
                value={formData.nisn}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Tahun Akademik</label>
              <input
                type="text"
                name="academic_year"
                value={formData.academic_year}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Program</label>
              <input
                type="text"
                name="program"
                value={formData.program}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Tingkat/Kelas</label>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Ekskul</label>
              <input
                type="text"
                name="ekskul"
                value={formData.ekskul}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Status Kelulusan</label>
              <select
                name="graduation_status"
                value={formData.graduation_status}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="Lulus">Lulus</option>
                <option value="Belum Lulus">Belum Lulus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">VA SPP</label>
              <input
                type="text"
                name="VA_SPP"
                value={formData.VA_SPP}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Status Pembayaran</label>
              <select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="Aktif">Aktif</option>
                <option value="Belum Aktif">Belum Aktif</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">ID Kelas</label>
              <input
                type="text"
                name="class_id"
                value={formData.class_id}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">ID Halaqah</label>
              <input
                type="text"
                name="halaqah_id"
                value={formData.halaqah_id}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Foto Profil</label>
              <input
                type="text"
                name="profile_picture"
                value={formData.profile_picture}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 px-4 py-2 border rounded text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}