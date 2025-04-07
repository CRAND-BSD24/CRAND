'use client';
import React, { useState } from 'react';
import { UserCircle, LogOut, Pencil } from 'lucide-react';
import { Dialog } from '@headlessui/react';

const initialUser = {
  name: 'Siti Nurhaliza',
  email: 'siti.santri@pesantren.com',
  role: 'student',
  joinedAt: '2023-09-01',
};

export default function ProfilePage() {
  const [user, setUser] = useState(initialUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const openModal = () => {
    setFormData({ name: user.name, email: user.email });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setUser({ ...user, name: formData.name, email: formData.email });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#96b8b8] to-[#216e69] flex items-center justify-center px-4 py-10">
      <div className="bg-[#fdfefe] border border-[#c9e7e6] rounded-3xl shadow-[8px_8px_20px_rgba(204,235,230,0.6),-8px_-8px_20px_rgba(255,255,255,0.6)] p-10 w-full max-w-lg relative">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-[#D9F1F0] to-[#B3E5E3] p-3 rounded-full shadow-inner mb-4">
            <UserCircle className="w-24 h-24 text-[#2B7A78]" />
          </div>
          <h2 className="text-2xl font-bold text-[#144E4A]">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        <div className="space-y-4 text-[#225E5C] text-sm font-medium">
          <div className="flex justify-between bg-[#E6F7F7] px-4 py-3 rounded-xl shadow-sm">
            <span>Role</span>
            <span className="font-semibold text-[#2B7A78]">{user.role}</span>
          </div>
          <div className="flex justify-between bg-[#E6F7F7] px-4 py-3 rounded-xl shadow-sm">
            <span>Tanggal Bergabung</span>
            <span>{user.joinedAt}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={openModal}
            className="w-full flex items-center justify-center gap-2 bg-[#3ABAB4] hover:bg-[#2A9D8F] text-white py-2.5 rounded-xl font-semibold shadow-md transition-all"
          >
            <Pencil size={18} />
            Edit Profil
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#F87171] to-[#EF4444] hover:to-[#DC2626] text-white py-2.5 rounded-xl font-semibold shadow-md transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <Dialog.Title className="text-xl font-bold text-[#2B7A78] mb-4">Edit Profil</Dialog.Title>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#2B7A78]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#2B7A78]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-[#2B7A78] text-white hover:bg-[#236d68]"
              >
                Simpan
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
