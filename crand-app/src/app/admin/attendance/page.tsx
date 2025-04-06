'use client';

import React, { useState } from 'react';
import { handleAbsensi } from './action';

export default function AbsensiPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setIsSuccess(false);
      setMessage('Silakan pilih foto terlebih dahulu.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedFile);

    const res = await handleAbsensi(formData);
    setIsSuccess(res.success);
    setMessage(res.message);
  };

  return (
    <div className="min-h-screen bg-[#9ACBD0] flex items-center justify-center px-4 py-10">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-[#48A6A7]">
        <h2 className="text-3xl font-bold text-[#006A71] text-center mb-6">
          Absensi Santri
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Upload Foto Wajah
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#48A6A7] focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#48A6A7] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#3d9395] transition-all duration-300"
          >
            Submit Absensi
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 text-center text-sm font-semibold ${
              isSuccess ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
