'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface LogoutButtonProps {
  className?: string;
  iconClassName?: string;
}

export default function LogoutButton({ className = '', iconClassName = '' }: LogoutButtonProps) {
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      // First call the server action to clear cookies
      await logout();
      
      // Show a success toast message
      toast.success("Berhasil logout");
      
      // Sign out and redirect to the dedicated logout page
      await signOut({ redirect: true, callbackUrl: '/logout' });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Gagal logout, silakan coba lagi");
    }
  };
  
  return (
    <button
      onClick={handleLogout}
      className={`flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold shadow-md transition-all duration-300 ${className}`}
    >
      <LogOut size={18} className={iconClassName} />
      Logout
    </button>
  );
}