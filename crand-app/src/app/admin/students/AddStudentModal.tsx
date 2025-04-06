'use client';

import { useEffect, useState } from 'react';
import { createStudent } from './action';

export default function AddStudentModal({ onStudentAdded }: { onStudentAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    program: '',
    gender: '',
    level: '',
    academic_year: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createStudent(form);

    if (success) {
      alert('Santri berhasil ditambahkan');
      setIsOpen(false);
      setForm({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        program: '',
        gender: '',
        level: '',
        academic_year: '',
      });
      onStudentAdded();
    } else {
      alert('Gagal menambahkan santri');
    }
  };

  // Blok scroll background saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
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
            className="bg-gray-100 p-6 rounded-xl w-full max-w-lg space-y-4 shadow-xl shadow-black"
            onClick={(e) => e.stopPropagation()} // cegah close saat klik dalam modal
          >
            <h2 className="text-2xl font-bold text-[#006A71] mb-2 text-center">Tambah Data Santri</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Nama" required />
              <Input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
              <Input name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="Nomor HP" />
              <Input name="address" value={form.address} onChange={handleChange} placeholder="Alamat" />
              <Input name="program" value={form.program} onChange={handleChange} placeholder="Program" />
              <Select name="gender" value={form.gender} onChange={handleChange} />
              <Input name="level" value={form.level} onChange={handleChange} placeholder="Level" />
              <Input name="academic_year" value={form.academic_year} onChange={handleChange} placeholder="Tahun Ajaran" />

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
}: {
  name: string;
  value: string;
  onChange: any;
  placeholder: string;
  required?: boolean;
}) => (
  <input
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className="w-full border border-[#9ACBD0] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#48A6A7] transition"
  />
);

const Select = ({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: any;
}) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full border border-[#9ACBD0] rounded-md px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#48A6A7] transition"
  >
    <option value="">Pilih Jenis Kelamin</option>
    <option value="Laki-laki">Laki-laki</option>
    <option value="Perempuan">Perempuan</option>
  </select>
);
