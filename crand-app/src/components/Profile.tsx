'use client';

import { useEffect, useState, useRef } from 'react';
import { UserCircle2, LogOut, Lock, Eye, EyeOff, Edit, Camera, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import Image from 'next/image';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  phone_number: string;
  updated_at: string;
  address?: string;
  profile_picture?: string;
  start_work_date?: string;
  position?: string;
  department?: string;
  nip?: string;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileEditForm {
  name: string;
  email: string;
  phone_number: string;
  address: string;
  profile_picture: string;
  nip?: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Password Modal State
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

  // Profile Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<ProfileEditForm>({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    profile_picture: '',
    nip: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      console.log('data profile: ', data);
      setProfile(data);
      setEditForm({
        name: data.name || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        address: data.address || '',
        profile_picture: data.profile_picture || '',
        nip: data.nip || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  // Password Handlers
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password baru tidak cocok dengan konfirmasi password",
      });
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengubah password');
      }

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

  // Profile Edit Handlers
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({
          ...prev,
          profile_picture: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);

    // Validation
    const phoneRegex = /^[0-9+\-\s()]*$/;
    if (editForm.phone_number && !phoneRegex.test(editForm.phone_number)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nomor telepon tidak valid",
      });
      setEditLoading(false);
      return;
    }

    if (editForm.nip && editForm.nip.length < 5) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "NIP minimal 5 karakter",
      });
      setEditLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengupdate profile');
      }

      toast({
        title: "Success",
        description: "Profile berhasil diupdate",
      });

      setShowEditModal(false);
      fetchProfile(); // Refresh data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-1 rounded-lg bg-blue-800/30 blur animate-pulse"></div>
          <div className="w-12 h-12 relative flex items-center justify-center bg-white rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-3 border-blue-800 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-500 flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-base font-bold text-gray-800">Error</h3>
            <p className="text-red-500 font-medium text-sm">Failed to load profile data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-24 h-24 bg-blue-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-teal-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative animate-fade-in z-0 w-full max-w-3xl">
        <div className="absolute -inset-1 bg-blue-800/20 rounded-2xl blur-md"></div>
        <div className="bg-white rounded-2xl shadow-lg p-5 mx-auto relative z-10 transition-all duration-300 hover:shadow-blue-200/50 border border-blue-100">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {/* Profile Photo */}
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-blue-100 shadow-md">
                {profile.profile_picture ? (
                  <Image 
                    src={profile.profile_picture} 
                    alt={profile.name} 
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100">
                    <UserCircle2 className="w-16 h-16 text-blue-800" />
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-xl font-bold text-blue-800 mb-1 text-center">{profile.name}</h2>
            <div className="bg-blue-50 rounded-full px-4 py-1 text-sm text-blue-600 font-medium border border-blue-100 shadow-sm mb-4 w-auto text-center">
              {profile.email}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
            <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/40 border border-blue-100 shadow-sm hover:shadow transition-all duration-200 group">
              <div className="bg-white p-2 rounded-full mr-2 shadow-sm group-hover:shadow group-hover:bg-blue-50 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-blue-700 block text-xs">NIP</span>
                <span className="text-blue-800 font-semibold block text-sm">{profile.nip || '-'}</span>
              </div>
            </div>

            <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/40 border border-blue-100 shadow-sm hover:shadow transition-all duration-200 group">
              <div className="bg-white p-2 rounded-full mr-2 shadow-sm group-hover:shadow group-hover:bg-blue-50 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-blue-700 block text-xs">Peran</span>
                <span className="text-blue-800 font-semibold capitalize block text-sm">{profile.role}</span>
              </div>
            </div>

            {profile.department && (
              <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/40 border border-blue-100 shadow-sm hover:shadow transition-all duration-200 group">
                <div className="bg-white p-2 rounded-full mr-2 shadow-sm group-hover:shadow group-hover:bg-blue-50 transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-blue-700 block text-xs">Departemen</span>
                  <span className="text-blue-800 font-semibold capitalize block text-sm">{profile.department}</span>
                </div>
              </div>
            )}

            {profile.position && (
              <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/40 border border-blue-100 shadow-sm hover:shadow transition-all duration-200 group">
                <div className="bg-white p-2 rounded-full mr-2 shadow-sm group-hover:shadow group-hover:bg-blue-50 transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-blue-700 block text-xs">Jabatan</span>
                  <span className="text-blue-800 font-semibold capitalize block text-sm">{profile.position}</span>
                </div>
              </div>
            )}

            <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/40 border border-blue-100 shadow-sm hover:shadow transition-all duration-200 group">
              <div className="bg-white p-2 rounded-full mr-2 shadow-sm group-hover:shadow group-hover:bg-blue-50 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-blue-700 block text-xs">Nomor Telepon</span>
                <span className="text-gray-800 block text-sm break-all">{profile.phone_number || '-'}</span>
              </div>
            </div>

            <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/40 border border-blue-100 shadow-sm hover:shadow transition-all duration-200 group">
              <div className="bg-white p-2 rounded-full mr-2 shadow-sm group-hover:shadow group-hover:bg-blue-50 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-blue-700 block text-xs">Alamat</span>
                <span className="text-gray-800 block text-sm break-words">{profile.address || '-'}</span>
              </div>
            </div>

            <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/40 border border-blue-100 shadow-sm hover:shadow transition-all duration-200 group">
              <div className="bg-white p-2 rounded-full mr-2 shadow-sm group-hover:shadow group-hover:bg-blue-50 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="font-medium text-blue-700 block text-xs">Bergabung Sejak</span>
                <span className="text-gray-800 block text-sm">
                  {new Date(profile.start_work_date || profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-200 text-xs font-medium"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Profile
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-xs font-medium"
            >
              <Lock className="w-3.5 h-3.5" />
              Ubah Password
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-lg w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
               <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                 <Edit className="w-5 h-5 text-blue-600" /> Edit Profile
               </h2>
               <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 mb-2 group">
                    {editForm.profile_picture ? (
                      <Image src={editForm.profile_picture} alt="Profile" fill sizes="96px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <UserCircle2 className="w-16 h-16" />
                      </div>
                    )}
                    <div 
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ubah Foto
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">NIP</label>
                    <input
                      type="text"
                      name="nip"
                      value={editForm.nip}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nomor Induk Pegawai"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nomor Telepon</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={editForm.phone_number}
                      onChange={handleEditChange}
                      pattern="[0-9+\-\s()]*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Alamat</label>
                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {editLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-w-md w-full mx-4">
            <div className="absolute -inset-1 bg-blue-800/20 rounded-lg blur-md"></div>
            <div className="bg-white rounded-lg shadow-lg p-5 relative z-10 overflow-hidden">
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-blue-100 rounded-full opacity-60"></div>
              <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-blue-50 rounded-full opacity-70"></div>

              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-1.5 rounded-lg">
                    <Lock className="h-4 w-4 text-blue-800" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-blue-800">
                      Ubah Password
                    </h2>
                    <p className="text-blue-600 text-xs">Silakan masukkan password Anda</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-500 hover:text-blue-700 transition-colors bg-gray-100 p-1.5 rounded-full hover:bg-blue-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-3 relative z-10">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 block">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Masukkan password saat ini"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 block">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Masukkan password baru"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 block">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Konfirmasi password baru"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? (
                      <>
                        <div className="relative h-4 w-4">
                          <div className="absolute top-0 left-0 h-full w-full border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
