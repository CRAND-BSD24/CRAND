'use client';
import React from 'react';
import { UserCircle2, LogOut } from 'lucide-react';

const dummyUser = {
  name: 'Admin Reza',
  email: 'admin@pesantren.com',
  role: 'Admin',
  joinedAt: '2024-01-10',
};

export default function ProfilePage() {
  const handleLogout = () => {
    // Tambahkan logika logout di sini
    console.log('Logout clicked');
    // Contoh: hapus cookie, redirect, dll.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6 flex flex-col items-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center justify-center mb-6">
          <UserCircle2 className="w-20 h-20 text-blue-500" />
        </div>
        <div className="space-y-4 text-gray-600">
          <div className="flex justify-between">
            <span className="font-medium">Nama</span>
            <span>{dummyUser.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Email</span>
            <span>{dummyUser.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Peran</span>
            <span className="text-blue-600 font-semibold">{dummyUser.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Bergabung</span>
            <span>{dummyUser.joinedAt}</span>
          </div>
        </div>
      </div>

      {/* Tombol Logout */}
      <button
        onClick={handleLogout}
        className="mt-6 flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow transition duration-300"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
