"use client";

import { createTeacher, updateTeacher } from "@/app/admin/teachers/action";
import { useState, useEffect } from "react";

interface Teacher {
  _id?: string;
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
  nip?: string;
}

export function AddTeacherModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<Teacher>({
    name: "",
    phone_number: "",
    email: "",
    address: "",
    nip: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTeacher(form);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-4 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold text-[#006A71]">Tambah Ustadz</h2>
        <input name="name" placeholder="Nama" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="phone_number" placeholder="Nomor Telepon" value={form.phone_number} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="address" placeholder="Alamat" value={form.address} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="nip" placeholder="NIP" value={form.nip} onChange={handleChange} className="w-full border p-2 rounded" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Batal
          </button>
          <button type="submit" className="px-4 py-2 bg-[#006A71] text-white rounded hover:bg-[#04888b]">
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}

export function EditTeacherModal({ teacher, onClose, onSuccess }: {
    teacher: Teacher;
    onClose: () => void;
    onSuccess: () => void;
  }) {
    const [form, setForm] = useState<Teacher>(teacher);
  
    useEffect(() => {
      setForm(teacher);
    }, [teacher]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form._id) return;
      await updateTeacher(form as Required<Teacher>);
      onSuccess();
      onClose();
    };
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md space-y-4 w-full max-w-md"
        >
          <h2 className="text-xl font-semibold text-[#006A71]">Edit Ustadz</h2>
          <input name="name" placeholder="Nama" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" required />
          <input name="phone_number" placeholder="Nomor Telepon" value={form.phone_number} onChange={handleChange} className="w-full border p-2 rounded" required />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="address" placeholder="Alamat" value={form.address} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="nip" placeholder="NIP" value={form.nip} onChange={handleChange} className="w-full border p-2 rounded" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-[#006A71] text-white rounded hover:bg-[#04888b]">
              Update
            </button>
          </div>
        </form>
      </div>
    );
  }
  