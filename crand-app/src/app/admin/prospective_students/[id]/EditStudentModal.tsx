"use client";

import { useState } from "react";
import { updateStudentById } from "./action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Student {
  _id: string;
  name?: string;
  email?: string;
  phone_number?: string;
  program?: string;
  academic_level?: string;
  gender?: string;
  address?: string;
  academic_year?: string;
  birth_place_date?: string;
  payment_status?: string;
  father_name?: string;
  mother_name?: string;
}

const programOptions = ["Reguler", "Shorhul Qurro'"];
const academicLevelOptions = ['Ula', 'Wustho', 'Ulya', 'Aliyah Agama', 'Aliyah IPA', 'SMP Formal'];

export default function EditStudentModal({ student }: { student: Student }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    name: student.name || "",
    email: student.email || "",
    phone_number: student.phone_number || "",
    program: student.program || "",
    academic_level: student.academic_level || "",
    gender: student.gender || "",
    address: student.address || "",
    academic_year: student.academic_year || "",
    birth_place_date: student.birth_place_date || "",
    father_name: student.father_name || "",
    mother_name: student.mother_name || "",
    payment_status: student.payment_status || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData = {
      ...form,
    };

    const success = await updateStudentById(student._id, updatedData);

    if (success) {
      toast.success("Data berhasil diperbarui");
      setIsOpen(false);
      router.refresh();
    } else {
      toast.error("Gagal memperbarui data");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-800 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white mt-16 p-4 sm:p-6 rounded-xl w-full max-w-lg space-y-3 sm:space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-2 text-center">
              Edit Data Calon Santri
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Nama" 
                className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base" 
              />
              <input 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="Email" 
                className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base" 
              />
              <input 
                name="phone_number" 
                value={form.phone_number} 
                onChange={handleChange} 
                placeholder="Nomor HP" 
                className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base" 
              />
              <input 
                name="father_name" 
                value={form.father_name} 
                onChange={handleChange} 
                placeholder="Nama Bapak" 
                className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base" 
              />
              <input 
                name="mother_name" 
                value={form.mother_name} 
                onChange={handleChange} 
                placeholder="Nama Ibu" 
                className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base" 
              />
              <input 
                name="address" 
                value={form.address} 
                onChange={handleChange} 
                placeholder="Alamat" 
                className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base" 
              />

              <select 
                name="program" 
                value={form.program} 
                onChange={handleChange} 
                className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base"
              >
                <option value="">Pilih Program</option>
                {programOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <select 
                name="gender" 
                value={form.gender} 
                onChange={handleChange} 
                className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>

              <select 
                name="academic_level" 
                value={form.academic_level} 
                onChange={handleChange} 
                className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base"
              >
                <option value="">Pilih Tingkat Akademik</option>
                {academicLevelOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <input 
                name="academic_year" 
                value={form.academic_year} 
                onChange={handleChange} 
                placeholder="Tahun Ajaran" 
                className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base" 
              />
              <input 
                name="birth_place_date" 
                value={form.birth_place_date} 
                onChange={handleChange} 
                placeholder="Tempat, Tanggal Lahir (contoh: Jakarta, 2005-08-12)" 
                className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base" 
              />
              
              <select 
                name="payment_status" 
                value={form.payment_status} 
                onChange={handleChange} 
                className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base"
              >
                <option value="">Status Pembayaran</option>
                <option value="Lunas">Lunas</option>
                <option value="Belum Lunas">Belum Lunas</option>
              </select>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition w-full sm:w-auto"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-transform duration-200 hover:scale-105 w-full sm:w-auto"
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
