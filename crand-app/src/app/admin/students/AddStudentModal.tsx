"use client";

import { useEffect, useState } from "react";
import { createStudent } from "./action";

export default function AddStudentModal({
  onStudentAdded,
}: {
  onStudentAdded: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    class: "",
    academic_level: "",
    gender: "",
    parent_name: "",
    batch_year: "",
    birth_date: "",
    birth_place: "",
    address: "",
    phone_number: "",
  });

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
        class: "",
        academic_level: "",
        gender: "",
        parent_name: "",
        batch_year: "",
        birth_date: "",
        birth_place: "",
        address: "",
        phone_number: "",
      });
      onStudentAdded();
    } else {
      alert("Gagal menambahkan santri");
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  // Generate options for academic year (last 10 years and next 2 years)
  const currentYear = new Date().getFullYear();
  const academicYearOptions = [];
  for (let year = currentYear - 10; year <= currentYear + 2; year++) {
    academicYearOptions.push(year);
  }

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
              {/* Required fields */}
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama Lengkap"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  name="class"
                  value={form.class}
                  onChange={handleChange}
                  options={[
                    "1A",
                    "1B",
                    "2A",
                    "2B",
                    "3A",
                    "3B",
                    "4A",
                    "4B",
                    "5A",
                    "5B",
                    "6A",
                    "6B",
                    "7A",
                    "7B",
                    "8A",
                    "8B",
                    "9A",
                    "9B",
                    "10A",
                    "10B",
                    "11A",
                    "11B",
                    "12A",
                    "12B",
                  ]}
                  placeholder="Kelas"
                  required
                />
                <Select
                  name="academic_level"
                  value={form.academic_level}
                  onChange={handleChange}
                  options={["Ibtidaiyah", "Tsanawiyah", "Aliyah"]}
                  placeholder="Tingkat Akademik"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  options={["Laki-laki", "Perempuan"]}
                  placeholder="Jenis Kelamin"
                  required
                />
                <Input
                  name="parent_name"
                  value={form.parent_name}
                  onChange={handleChange}
                  placeholder="Nama Orang Tua"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  name="batch_year"
                  value={form.batch_year}
                  onChange={handleChange}
                  options={academicYearOptions.map((year) => year.toString())}
                  placeholder="Tahun Angkatan"
                  required
                />
                <Input
                  name="birth_date"
                  type="date"
                  value={form.birth_date}
                  onChange={handleChange}
                  placeholder="Tanggal Lahir"
                />
              </div>

              {/* Additional information */}
              <Input
                name="birth_place"
                value={form.birth_place}
                onChange={handleChange}
                placeholder="Tempat Lahir"
              />
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Alamat Lengkap"
              />
              <Input
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="Nomor Telepon/HP"
              />

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#48A6A7] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#359d9f] transition-transform duration-200 hover:scale-105"
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
  onChange: any;
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

interface SelectProps {
  name: string;
  value: string;
  onChange: any;
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
