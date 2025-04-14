"use client";

import { useEffect, useState } from "react";
import { UserCircle2, LogOut, Lock, Eye, EyeOff } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
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
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          credentials: "include",
        });

        if (!response.ok) {
          console.error(
            "Failed to fetch profile:",
            response.status,
            response.statusText
          );
          if (response.status === 401) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Sesi Anda telah berakhir. Silakan login kembali.",
            });
            router.push("/login");
            return;
          }
          throw new Error(
            `Failed to fetch profile: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("data profile: ", data);
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat profil. Silakan coba lagi nanti.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, toast]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔐 [DEBUG] Password change form submitted");
    setPasswordLoading(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      console.log("❌ [DEBUG] Password mismatch:", {
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
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
      console.log("🔐 [DEBUG] Sending password change request...");
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();
      console.log("🔐 [DEBUG] Password change response:", {
        status: response.status,
        ok: response.ok,
        message: data.message,
      });

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengubah password");
      }

      console.log("✅ [DEBUG] Password changed successfully");
      toast({
        title: "Success",
        description: "Password berhasil diubah",
      });

      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("❌ [DEBUG] Password change error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan";
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
          <div className="w-12 h-12 relative flex items-center justify-center bg-white rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-3 border-emerald-800 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-500 flex items-center space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-base font-bold text-gray-800">Error</h3>
            <p className="text-red-500 font-medium text-sm">
              Failed to load profile data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-24 h-24 bg-emerald-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-teal-200 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative animate-fade-in z-0 w-full max-w-2xl">
        <div className="absolute -inset-1 bg-emerald-800/20 rounded-2xl blur-md"></div>
        <div className="bg-white rounded-2xl shadow-lg p-5 mx-auto relative z-10 transition-all duration-300 hover:shadow-emerald-200/50 border border-emerald-100">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {/* Compact hexagonal frame for profile photo */}
              <div className="relative h-24 w-24">
                <svg
                  className="absolute top-0 left-0 w-full h-full"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="profileGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#047857" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <clipPath id="hexagonClip">
                      <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" />
                    </clipPath>
                  </defs>
                  <path
                    d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z"
                    fill="url(#profileGradient)"
                    className="transform transition-transform duration-500 hover:scale-105"
                  />
                  <path
                    d="M50 5L87.5 26.65V70L50 91.7L12.5 70V26.65L50 5Z"
                    fill="white"
                    className="transition-all duration-500 hover:fill-emerald-50"
                  />
                </svg>
                <div className="absolute inset-4 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center rounded-full bg-emerald-100 overflow-hidden">
                    <UserCircle2 className="w-16 h-16 text-emerald-800 transform transition-transform hover:scale-110 duration-300" />
                  </div>
                </div>
                {/* Small decorative dots */}
                <div className="absolute -top-1 -right-1 bg-emerald-500 h-3 w-3 rounded-full shadow-sm animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 bg-emerald-300 h-2 w-2 rounded-full shadow-sm"></div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-emerald-800 mb-1 text-center">
              {profile.name}
            </h2>
            <div className="bg-emerald-50 rounded-full px-4 py-1 text-sm text-emerald-600 font-medium border border-emerald-100 shadow-sm mb-4 w-auto text-center">
              {profile.email}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100/40 border border-emerald-100 shadow-sm hover:shadow transition-all duration-200 group">
              <div className="bg-white p-2 rounded-full mr-2 shadow-sm group-hover:shadow group-hover:bg-emerald-50 transition-all duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-emerald-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <span className="font-medium text-emerald-700 block text-xs">
                  Peran
                </span>
                <span className="text-emerald-800 font-semibold capitalize block text-sm">
                  {profile.role}
                </span>
              </div>
            </div>

            <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100/40 border border-emerald-100 shadow-sm hover:shadow transition-all duration-200 group">
              <div className="bg-white p-2 rounded-full mr-2 shadow-sm group-hover:shadow group-hover:bg-emerald-50 transition-all duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-emerald-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <span className="font-medium text-emerald-700 block text-xs">
                  Nomor Telepon
                </span>
                <span className="text-gray-800 block text-sm truncate">
                  {profile.phone_number}
                </span>
              </div>
            </div>

            <div className="flex items-center p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100/40 border border-emerald-100 shadow-sm hover:shadow transition-all duration-200 group col-span-2">
              <div className="bg-white p-2 rounded-full mr-2 shadow-sm group-hover:shadow group-hover:bg-emerald-50 transition-all duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-emerald-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <span className="font-medium text-emerald-700 block text-xs">
                  Bergabung Sejak
                </span>
                <span className="text-gray-800 block text-sm">
                  {new Date(profile.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all duration-200 text-xs font-medium"
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

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-w-md w-full mx-4">
            <div className="absolute -inset-1 bg-emerald-800/20 rounded-lg blur-md"></div>
            <div className="bg-white rounded-lg shadow-lg p-5 relative z-10 overflow-hidden">
              {/* Decorative corner designs */}
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-emerald-100 rounded-full opacity-60"></div>
              <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-emerald-50 rounded-full opacity-70"></div>

              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-100 p-1.5 rounded-lg">
                    <Lock className="h-4 w-4 text-emerald-800" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-emerald-800">
                      Ubah Password
                    </h2>
                    <p className="text-emerald-600 text-xs">
                      Silakan masukkan password Anda
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-500 hover:text-emerald-700 transition-colors bg-gray-100 p-1.5 rounded-full hover:bg-emerald-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div className="space-y-1 relative z-10">
                  <label className="block text-xs font-medium text-emerald-700">
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                      <Lock className="h-4 w-4 text-emerald-500" />
                    </div>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-8 p-2 text-sm bg-emerald-50/50 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all pr-8 placeholder-emerald-300"
                      placeholder="Password saat ini"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700 p-1 rounded-full hover:bg-white transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-emerald-700">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all pr-8"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700"
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-emerald-700">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all pr-8"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-4 relative z-10">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-1.5 text-sm border border-emerald-200 rounded-lg text-emerald-800 hover:bg-emerald-50 transition-all duration-200 hover:border-emerald-300 shadow-sm hover:shadow"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-1.5 text-sm bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-lg hover:shadow-md transition-all duration-200 disabled:opacity-50 flex items-center gap-1 transform hover:translate-y-[-1px] active:translate-y-0 shadow"
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
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
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
