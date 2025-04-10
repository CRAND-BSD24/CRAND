'use client';

import { useEffect, useState } from 'react';
import { UserCircle2, LogOut, Lock, Eye, EyeOff } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  phone_number: string;
  updated_at: string;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        console.log('data profile: ', data);
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 [DEBUG] Password change form submitted');
    setPasswordLoading(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      console.log('❌ [DEBUG] Password mismatch:', {
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password baru tidak cocok dengan konfirmasi password",
      });
      setPasswordLoading(false);
      return;
    }

    try {
      console.log('🔐 [DEBUG] Sending password change request...');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();
      console.log('🔐 [DEBUG] Password change response:', {
        status: response.status,
        ok: response.ok,
        message: data.message
      });

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengubah password');
      }

      console.log('✅ [DEBUG] Password changed successfully');
      toast({
        title: "Success",
        description: "Password berhasil diubah",
      });

      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('❌ [DEBUG] Password change error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-1 rounded-lg bg-emerald-800/30 blur animate-pulse"></div>
          <div className="w-16 h-16 relative flex items-center justify-center bg-white rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-800 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 flex items-center space-x-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Error</h3>
            <p className="text-red-500 font-medium">Failed to load profile data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mt-16 p-4 sm:p-6 md:p-10">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 sm:w-64 h-32 sm:h-64 bg-emerald-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-32 sm:w-64 h-32 sm:h-64 bg-teal-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative animate-fade-in z-0 w-full">
        <div className="absolute -inset-1 bg-emerald-800/20 rounded-3xl blur-md"></div>
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 max-w-4xl mx-auto relative z-10 transition-all duration-300 hover:shadow-emerald-200/50 border border-emerald-100">
          <div className="flex flex-col items-center">
            <div className="relative mb-6 sm:mb-8">
              {/* Hexagonal frame for profile photo */}
              <div className="relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48">
                <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#047857" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <clipPath id="hexagonClip">
                      <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" />
                    </clipPath>
                  </defs>
                  <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" fill="url(#profileGradient)"
                    className="transform transition-transform duration-500 hover:scale-105" />
                  <path d="M50 5L87.5 26.65V70L50 91.7L12.5 70V26.65L50 5Z"
                    fill="white" className="transition-all duration-500 hover:fill-emerald-50" />
                </svg>
                <div className="absolute inset-5 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center rounded-full bg-emerald-100 overflow-hidden">
                    <UserCircle2 className="w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 text-emerald-800 transform transition-transform hover:scale-110 duration-300" />
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-1 -right-1 bg-emerald-500 h-4 sm:h-6 w-4 sm:w-6 rounded-full shadow-lg animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 bg-emerald-300 h-3 sm:h-5 w-3 sm:w-5 rounded-full shadow-lg"></div>
              </div>

              <div className="absolute -bottom-2 right-0 transform translate-x-1/4 bg-white rounded-full shadow-lg p-2 border border-emerald-100">
                <div className="bg-emerald-500 rounded-full h-3 sm:h-5 w-3 sm:w-5 animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-800 mb-2 text-center">{profile.name}</h2>
            <div className="bg-emerald-50 rounded-full px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-base sm:text-lg text-emerald-600 font-medium border border-emerald-100 shadow-sm mb-6 sm:mb-8 w-full sm:w-auto text-center">
              {profile.email}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-sm sm:text-base">
            <div className="flex items-center p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/40 border border-emerald-100 shadow-sm hover:shadow transition-all duration-200 group">
              <div className="bg-white p-3 sm:p-4 rounded-full mr-3 sm:mr-4 shadow-sm group-hover:shadow group-hover:bg-emerald-50 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-7 w-5 sm:w-7 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="font-medium text-emerald-700 block">Peran</span>
                <span className="text-emerald-800 font-semibold capitalize block mt-1">{profile.role}</span>
              </div>
            </div>

            <div className="flex items-center p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/40 border border-emerald-100 shadow-sm hover:shadow transition-all duration-200 group">
              <div className="bg-white p-3 sm:p-4 rounded-full mr-3 sm:mr-4 shadow-sm group-hover:shadow group-hover:bg-emerald-50 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-7 w-5 sm:w-7 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="font-medium text-emerald-700 block">Nomor Telepon</span>
                <span className="text-gray-800 block mt-1">{profile.phone_number}</span>
              </div>
            </div>

            <div className="flex items-center p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/40 border border-emerald-100 shadow-sm hover:shadow transition-all duration-200 group sm:col-span-2 lg:col-span-1">
              <div className="bg-white p-3 sm:p-4 rounded-full mr-3 sm:mr-4 shadow-sm group-hover:shadow group-hover:bg-emerald-50 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-7 w-5 sm:w-7 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="font-medium text-emerald-700 block">Bergabung Sejak</span>
                <span className="text-gray-800 block mt-1">{new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all duration-200 text-sm sm:text-base font-medium"
            >
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              Ubah Password
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm sm:text-base font-medium"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-w-md w-full mx-4">
            <div className="absolute -inset-1 bg-emerald-800/20 rounded-2xl blur-md"></div>
            <div className="bg-white rounded-2xl shadow-2xl p-8 relative z-10 overflow-hidden">
              {/* Decorative corner designs */}
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-100 rounded-full opacity-60"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-50 rounded-full opacity-70"></div>

              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <div className="bg-emerald-100 p-2 rounded-xl mb-2">
                    <Lock className="h-6 w-6 text-emerald-800" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-800">
                    Ubah Password
                  </h2>
                  <p className="text-emerald-600 text-sm mt-1">Silakan masukkan password Anda</p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-500 hover:text-emerald-700 transition-colors bg-gray-100 p-2 rounded-full hover:bg-emerald-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2 relative z-10">
                  <label className="block text-sm font-medium text-emerald-700">Password Saat Ini</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-emerald-500" />
                    </div>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all pr-10 placeholder-emerald-300"
                      placeholder="Masukkan password saat ini"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700 p-1 rounded-full hover:bg-white transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2.5 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2.5 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8 relative z-10">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-6 py-2.5 border border-emerald-200 rounded-lg text-emerald-800 hover:bg-emerald-50 transition-all duration-200 hover:border-emerald-300 shadow-sm hover:shadow"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-lg hover:shadow-md transition-all duration-200 disabled:opacity-50 flex items-center gap-2 transform hover:translate-y-[-2px] active:translate-y-0 shadow"
                  >
                    {passwordLoading ? (
                      <>
                        <div className="relative h-5 w-5">
                          <div className="absolute top-0 left-0 h-full w-full border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}