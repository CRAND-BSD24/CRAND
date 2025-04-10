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
      
      // Use a combined approach for more reliable redirects
      await signOut({
        redirect: false,
      });
      
      // Force a hard redirect to the landing page to bypass middleware complexities
      window.location.href = '/';
      
      // The router navigation below might not execute due to the hard redirect above
      // router.push('/');
      // router.refresh();
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