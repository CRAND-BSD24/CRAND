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
    console.log('Logout clicked');
    // Tambahkan aksi logout seperti menghapus cookie/token dan redirect
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F4F5] to-[#B1E3E5] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#B8E2E4] p-8 max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="bg-blue-100 p-2 rounded-full shadow-inner">
              <UserCircle2 className="w-24 h-24 text-blue-500" />
            </div>
            <div className="absolute bottom-1 right-1 bg-white rounded-full shadow p-1 text-green-500 text-xs font-bold">
              ●
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-700">{dummyUser.name}</h2>
          <p className="text-sm text-gray-500 mb-6">{dummyUser.email}</p>
        </div>

        <div className="grid gap-4 text-sm text-gray-600">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Peran</span>
            <span className="text-blue-600 font-semibold">{dummyUser.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Tanggal Bergabung</span>
            <span>{dummyUser.joinedAt}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold shadow-md transition-all duration-300"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
