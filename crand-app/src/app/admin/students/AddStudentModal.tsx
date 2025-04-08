"use client";

import { useEffect, useState } from "react";
import { createStudent } from "./action";

// Interface khusus untuk form input
interface NewStudentFormData {
  name: string;
  class_id: string;
  academic_level: string;
  gender: string;
  parent_name: string;
  birth_place_date: string;
  address: string;
  phone_number: string;
}

interface Class {
  _id: string;
  class_name: string;
}

export default function AddStudentModal({
  onStudentAdded,
}: {
  onStudentAdded: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [form, setForm] = useState<NewStudentFormData>({
    name: "",
    class_id: "",
    academic_level: "",
    gender: "",
    parent_name: "",
    birth_place_date: "",
    address: "",
    phone_number: "",
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await createStudent(form);
    if (success) {
      alert("Santri berhasil ditambahkan");
      setIsOpen(false);
      setForm({
        name: "",
        class_id: "",
        academic_level: "",
        gender: "",
        parent_name: "",
        birth_place_date: "",
        address: "",
        phone_number: "",
      });
      onStudentAdded();
    } else {
      alert("Gagal menambahkan santri");
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#006A71] text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-[#04858c] transition-transform duration-200 hover:scale-105"
      >
        + Tambah Santri
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div
            className="bg-gray-100 p-6 rounded-xl w-full max-w-lg space-y-4 shadow-xl shadow-black overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-[#006A71] mb-2 text-center">
              Tambah Data Santri
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Nama Lengkap" required />

              <div className="grid grid-cols-2 gap-4">
                <select
                  name="class_id"
                  value={form.class_id}
                  onChange={handleChange}
                  className="w-full border border-[#9ACBD0] rounded-md px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#48A6A7] transition"
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map((kelas) => (
                    <option key={kelas._id} value={kelas._id}>
                      {kelas.class_name}
                    </option>
                  ))}
                </select>
                <Select name="academic_level" value={form.academic_level} onChange={handleChange} options={["Ibtidaiyah", "Tsanawiyah", "Aliyah", "SMA", "Wustho"]} placeholder="Tingkat Akademik" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select name="gender" value={form.gender} onChange={handleChange} options={["Laki-laki", "Perempuan"]} placeholder="Jenis Kelamin" required />
                <Input name="parent_name" value={form.parent_name} onChange={handleChange} placeholder="Nama Orang Tua" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input name="birth_place_date" value={form.birth_place_date} onChange={handleChange} placeholder="Tempat Tanggal Lahir" />
              </div>

              <Input name="address" value={form.address} onChange={handleChange} placeholder="Alamat Lengkap" />
              <Input name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="Nomor Telepon/HP" />

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                  Batal
                </button>
                <button type="submit" className="bg-[#48A6A7] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#359d9f] transition-transform duration-200 hover:scale-105">
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

// Komponen input
const Input = ({
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
}) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className="w-full border border-[#9ACBD0] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#48A6A7] transition"
  />
);

// Komponen select dropdown
interface SelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
}

const Select = ({
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}: SelectProps) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    required={required}
    className="w-full border border-[#9ACBD0] rounded-md px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#48A6A7] transition"
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);