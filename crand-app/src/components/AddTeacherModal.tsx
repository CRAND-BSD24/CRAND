"use client";

import { createTeacher, updateTeacher } from "@/app/admin/teachers/action";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Teacher {
  _id?: string;
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
  nip?: string;
  role?: string;
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
    try {
      await createTeacher({
        ...form,
        email: form.email || '',
        address: form.address || '',
        nip: form.nip || ''
      });
      toast.success("SDM berhasil ditambahkan");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Gagal menambahkan SDM");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white mt-16 p-4 sm:p-6 rounded-xl w-full max-w-lg space-y-3 sm:space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-2 text-center">Tambah SDM</h2>
        <input 
          name="name" 
          placeholder="Nama" 
          value={form.name} 
          onChange={handleChange} 
          className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base" 
          required 
        />
        <input 
          name="phone_number" 
          placeholder="Nomor Telepon" 
          value={form.phone_number} 
          onChange={handleChange} 
          className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base" 
          required 
        />
        <input 
          name="email" 
          placeholder="Email" 
          value={form.email} 
          onChange={handleChange} 
          className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base" 
        />
        <input 
          name="address" 
          placeholder="Alamat" 
          value={form.address} 
          onChange={handleChange} 
          className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base" 
        />
        <input 
          name="nip" 
          placeholder="NIP" 
          value={form.nip} 
          onChange={handleChange} 
          className="w-full border border-blue-300 rounded-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800 transition text-sm sm:text-base" 
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
            className="bg-blue-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-transform duration-200 hover:scale-105 w-full sm:w-auto"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}

export function DetailTeacherModal({ teacher, onClose }: { teacher: Teacher; onClose: () => void }) {
  const displayDepartment =
    teacher.role === "teacher"
      ? "Tahfizh"
      : teacher.role === "educator"
      ? "KBM"
      : teacher.role || "-";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 mt-16 w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden border border-blue-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-white/60">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-blue-900">Detail SDM</h2>
            <p className="text-sm text-blue-700 mt-1">Informasi lengkap data SDM</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <span className="sr-only">Tutup</span>
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="flex items-center gap-4 bg-white/60 rounded-xl p-4 border border-blue-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-semibold">
              {teacher.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-blue-900">{teacher.name}</p>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {displayDepartment}
                </span>
              </div>
              <p className="text-xs text-blue-700">
                NIP: <span className="font-medium">{teacher.nip || "-"}</span>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/70 rounded-xl p-4 border border-blue-100">
              <div className="text-xs font-semibold text-blue-600 mb-1">No. HP</div>
              <div className="text-sm text-slate-800">{teacher.phone_number}</div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 border border-blue-100">
              <div className="text-xs font-semibold text-blue-600 mb-1">Email</div>
              <div className="text-sm text-slate-800 break-all">{teacher.email || "-"}</div>
            </div>
            <div className="sm:col-span-2 bg-white/70 rounded-xl p-4 border border-blue-100">
              <div className="text-xs font-semibold text-blue-600 mb-1">Alamat</div>
              <div className="text-sm text-slate-800 whitespace-pre-line">
                {teacher.address || "-"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 bg-white/70 border-t border-blue-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-blue-700 text-blue-800 hover:bg-blue-50 font-medium text-sm transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
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
      try {
        await updateTeacher(form as Required<Teacher>);
        toast.success("Data SDM berhasil diperbarui");
        onSuccess();
        onClose();
      } catch (error) {
        toast.error("Gagal memperbarui data SDM");
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-blue-50 to-teal-50 mt-16 w-full max-w-2xl rounded-2xl shadow-2xl border border-blue-100 max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-white/60">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900">Edit SDM</h2>
              <p className="text-sm text-blue-700 mt-1">Perbarui informasi data SDM</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <span className="sr-only">Tutup</span>
              ✕
            </button>
          </div>
          <div className="px-6 py-5 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-blue-700 mb-1">
                  Nama
                </label>
                <input
                  name="name"
                  placeholder="Nama lengkap SDM"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent text-sm sm:text-base bg-white/80"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">
                  NIP
                </label>
                <input
                  name="nip"
                  placeholder="NIP"
                  value={form.nip}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent text-sm sm:text-base bg-white/80"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">
                  Departemen
                </label>
                <select
                  name="role"
                  value={form.role || "teacher"}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-blue-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent text-sm sm:text-base bg-white/80 capitalize"
                >
                  <option value="teacher">Tahfizh</option>
                  <option value="educator">KBM</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">
                  Nomor Telepon
                </label>
                <input
                  name="phone_number"
                  placeholder="Nomor telepon"
                  value={form.phone_number}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent text-sm sm:text-base bg-white/80"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent text-sm sm:text-base bg-white/80"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-blue-700 mb-1">
                  Alamat
                </label>
                <input
                  name="address"
                  placeholder="Alamat lengkap"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent text-sm sm:text-base bg-white/80"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-4 bg-white/70 border-t border-blue-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium transition-colors w-full sm:w-auto"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-800 text-white hover:bg-blue-700 text-sm font-semibold shadow-md hover:shadow-lg transition-transform duration-200 transform hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    );
  }
  
