'use client';

import { useState } from 'react';
import { updateTeacher } from '../action';

export default function EditTeacherModal({ teacher, onUpdated }: { teacher: any; onUpdated: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: teacher.user?.name || '',
    email: teacher.user?.email || '',
    phone_number: teacher.user?.phone_number || '',
    nip: teacher.nip || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const success = await updateTeacher(teacher._id, {
      ...form,
      user_id: teacher.user?._id,
    });

    if (success) {
      onUpdated();
      setIsOpen(false);
    } else {
      alert("Gagal update data.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 px-4 py-2 bg-[#4f68b4] text-white rounded-md hover:bg-[#7fbdff]"
      >
        Edit Data
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-gray-100 p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-[#006A71] mb-2">Edit Ustadz</h2>

            <input
              name="name"
              placeholder="Nama"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
            <input
              name="phone_number"
              placeholder="No HP"
              value={form.phone_number}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
            <input
              name="nip"
              placeholder="NIP"
              value={form.nip}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#48A6A7] text-white rounded-md"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
