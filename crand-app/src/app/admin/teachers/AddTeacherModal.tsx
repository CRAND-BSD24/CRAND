'use client';

import { useEffect, useState } from 'react';
import { createTeacher } from './action';

export default function AddTeacherModal({ onTeacherAdded }: { onTeacherAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    nip: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createTeacher(form);

    if (success) {
      alert('Ustadz berhasil ditambahkan');
      setIsOpen(false);
      setForm({ name: '', nip: '' });
      onTeacherAdded();
    } else {
      alert('Gagal menambahkan ustadz');
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#006A71] text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-[#04858c] transition-transform duration-200 hover:scale-105"
      >
        + Tambah Ustadz
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-[#006A71] mb-2 text-center">Tambah Ustadz</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama"
                required
                className="w-full border border-[#9ACBD0] rounded-md px-4 py-2"
              />
              <input
                name="nip"
                value={form.nip}
                onChange={handleChange}
                placeholder="NIP"
                className="w-full border border-[#9ACBD0] rounded-md px-4 py-2"
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
                  className="bg-[#48A6A7] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#359d9f] transition-transform hover:scale-105"
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
