'use client';

import { useEffect, useState } from 'react';
import { UserCircle2, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E0F4F5] to-[#B1E3E5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E0F4F5] to-[#B1E3E5] flex items-center justify-center">
        <div className="text-red-500">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#acf9ff] to-[#124e50] flex items-center justify-center px-4 py-10">
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
          <h2 className="text-2xl font-bold text-gray-700">{profile.name}</h2>
          <p className="text-sm text-gray-500 mb-6">{profile.email}</p>
        </div>

        <div className="grid gap-4 text-sm text-gray-600">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Peran</span>
            <span className="text-blue-600 font-semibold capitalize">{profile.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Tanggal Bergabung</span>
            <span>{new Date(profile.createdAt).toLocaleDateString('id-ID')}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-300 text-white py-2 rounded-xl font-semibold shadow-md transition-all duration-300"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
} 