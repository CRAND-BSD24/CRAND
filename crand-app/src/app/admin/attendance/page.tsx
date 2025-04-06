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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-blue-200">
        <h2 className="text-3xl text-black text-center mb-6">Absensi</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Upload Foto Wajah</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300"
          >
            Submit Absensi
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 text-center text-sm font-medium ${
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
