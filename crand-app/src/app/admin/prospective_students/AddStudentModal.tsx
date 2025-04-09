"use client";

import { useEffect, useState } from "react";
import { createStudent } from "./action";

export default function AddProspectiveStudentModal({
  onStudentAdded,
}: {
  onStudentAdded: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    program: "",
    academic_level: "",
    gender: "",
    address: "",
    academic_year: currentYear.toString(),
    birth_place_date: "",
    payment_status: "Belum Lunas",
    father_name: "",
    mother_name: "",
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
      alert("Calon santri berhasil ditambahkan");
      setIsOpen(false);
      setForm({
        name: "",
        email: "",
        phone_number: "",
        program: "",
        academic_level: "",
        gender: "",
        address: "",
        academic_year: currentYear.toString(),
        birth_place_date: "",
        payment_status: "Belum Lunas",
        father_name: "",
        mother_name: "",
      });
      onStudentAdded();
    } else {
      alert("Gagal menambahkan calon santri");
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
        + Tambah Calon Santri
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div
            className="bg-gray-100 p-6 rounded-xl w-full max-w-lg space-y-4 shadow-xl shadow-black"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-[#006A71] mb-2 text-center">
              Tambah Data Calon Santri
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama Lengkap"
                required
              />
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
              />
              <Input
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="Nomor HP"
              />
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Alamat"
              />
              <Select name="program" value={form.program} onChange={handleChange}>
                <option value="">Pilih Program</option>
                <option value="Reguler">Reguler</option>
                <option value="Shorhul Qurro">Shorhul Qurro'</option>
              </Select>
              <Select name="gender" value={form.gender} onChange={handleChange}>
                <option key="default" value="">Pilih Jenis Kelamin</option>
                <option key="male" value="Laki-laki">Laki-laki</option>
                <option key="female" value="Perempuan">Perempuan</option>
              </Select>
              <Select
                name="academic_level"
                value={form.academic_level}
                onChange={handleChange}
              >
                <option value="">Pilih Jenjang Pendidikan</option>
                <option value="Ula">Ula</option>
                <option value="Wustho">Wustho</option>
                <option value="Ulya">Ulya</option>
                <option value="Formal Aliyah Agama">Formal Aliyah Agama</option>
                <option value="Formal Aliyah IPA">Formal Aliyah IPA</option>
              </Select>
              <Input
                name="academic_year"
                value={form.academic_year}
                onChange={handleChange}
                placeholder="Tahun Ajaran"
                readOnly
              />
              <Input
                name="father_name"
                value={form.father_name}
                onChange={handleChange}
                placeholder="Nama Ayah"
              />
              <Input
                name="mother_name"
                value={form.mother_name}
                onChange={handleChange}
                placeholder="Nama Ibu"
              />
              <Input
                name="birth_place_date"
                value={form.birth_place_date}
                onChange={handleChange}
                placeholder="Tempat, Tanggal Lahir"
              />
              <Select
                name="payment_status"
                value={form.payment_status}
                onChange={handleChange}
              >
                <option value="Belum Lunas">Belum Lunas</option>
                <option value="Lunas">Lunas</option>
              </Select>

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

interface InputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  readOnly?: boolean;
}

const Input = ({
  name,
  value,
  onChange,
  placeholder,
  required = false,
  readOnly = false,
}: InputProps) => (
  <input
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    readOnly={readOnly}
    className="w-full border border-[#9ACBD0] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#48A6A7] transition"
  />
);

interface SelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

const Select = ({ name, value, onChange, children }: SelectProps) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full border border-[#9ACBD0] rounded-md px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#48A6A7] transition"
  >
    {children}
  </select>
);
