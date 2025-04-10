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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white mt-16 p-4 sm:p-6 rounded-xl w-full max-w-lg space-y-3 sm:space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 mb-2 text-center">Tambah Ustadz</h2>
        <input 
          name="name" 
          placeholder="Nama" 
          value={form.name} 
          onChange={handleChange} 
          className="w-full border border-emerald-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition text-sm sm:text-base" 
          required 
        />
        <input 
          name="phone_number" 
          placeholder="Nomor Telepon" 
          value={form.phone_number} 
          onChange={handleChange} 
          className="w-full border border-emerald-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition text-sm sm:text-base" 
          required 
        />
        <input 
          name="email" 
          placeholder="Email" 
          value={form.email} 
          onChange={handleChange} 
          className="w-full border border-emerald-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition text-sm sm:text-base" 
        />
        <input 
          name="address" 
          placeholder="Alamat" 
          value={form.address} 
          onChange={handleChange} 
          className="w-full border border-emerald-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition text-sm sm:text-base" 
        />
        <input 
          name="nip" 
          placeholder="NIP" 
          value={form.nip} 
          onChange={handleChange} 
          className="w-full border border-emerald-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition text-sm sm:text-base" 
        />
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 pt-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition w-full sm:w-auto"
          >
            Batal
          </button>
          <button 
            type="submit" 
            className="bg-emerald-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-transform duration-200 hover:scale-105 w-full sm:w-auto"
          >
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white mt-16 p-4 sm:p-6 rounded-xl w-full max-w-lg space-y-3 sm:space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 mb-2 text-center">Edit Ustadz</h2>
          <input 
            name="name" 
            placeholder="Nama" 
            value={form.name} 
            onChange={handleChange} 
            className="w-full border border-emerald-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition text-sm sm:text-base" 
            required 
          />
          <input 
            name="phone_number" 
            placeholder="Nomor Telepon" 
            value={form.phone_number} 
            onChange={handleChange} 
            className="w-full border border-emerald-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition text-sm sm:text-base" 
            required 
          />
          <input 
            name="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={handleChange} 
            className="w-full border border-emerald-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition text-sm sm:text-base" 
          />
          <input 
            name="address" 
            placeholder="Alamat" 
            value={form.address} 
            onChange={handleChange} 
            className="w-full border border-emerald-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition text-sm sm:text-base" 
          />
          <input 
            name="nip" 
            placeholder="NIP" 
            value={form.nip} 
            onChange={handleChange} 
            className="w-full border border-emerald-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition text-sm sm:text-base" 
          />
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition w-full sm:w-auto"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="bg-emerald-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-transform duration-200 hover:scale-105 w-full sm:w-auto"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    );
  }
  