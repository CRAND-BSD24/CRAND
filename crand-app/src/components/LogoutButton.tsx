'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className = '' }: LogoutButtonProps) {
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      // First call the server action to clear cookies
      await logout();
      
      // Then call the client-side signOut
      await signOut({ redirect: false });
      
      // Redirect to login page
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <button
      onClick={handleLogout}
      className={`flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold shadow-md transition-all duration-300 ${className}`}
    >
      <LogOut size={18} />
      Logout
    </button>
  );
} 