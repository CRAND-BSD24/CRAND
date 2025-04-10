'use client';

import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Home, Users, UserPlus, CalendarCheck, GraduationCap, BookOpen, User, Bot, Menu, X, LogOut } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { logout } from '@/app/actions/auth';

const AdminSidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLinkClick = useCallback(() => {
    // Only close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
  }, []);

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
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Gagal logout, silakan coba lagi");
    }
  };

  // Close sidebar when route changes
  useEffect(() => {
    handleLinkClick();
  }, [pathname, handleLinkClick]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-emerald-800 border-b border-emerald-700/50 z-50 flex items-center px-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg text-white hover:bg-emerald-700 transition-colors lg:hidden"
        >
          {isCollapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
        <div className="flex items-center gap-3 ml-4">
          <Image src={logo} alt="logo" className="w-10 h-10 rounded-lg" width={40} height={40} />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white">CRAND</h1>
            <p className="text-xs text-emerald-200/80">Admin Dashboard</p>
          </div>
        </div>
      </header>

      <aside className={cn(
        'fixed top-16 lg:top-0 lg:pt-16 left-0 w-64 h-screen bg-emerald-800 flex flex-col transition-all duration-300 ease-in-out border-r border-emerald-700/50 z-40',
        isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
      )}>
        <div className="flex flex-col h-[calc(100vh-7rem)] overflow-y-auto py-6 px-4">
          <div className="lg:hidden">
            <hr className="my-4 border-emerald-800/50" />
          </div>

          <nav className="space-y-2">
            {[
              { href: '/admin', icon: Home, label: 'Dashboard' },
              { href: '/admin/students', icon: Users, label: 'Santri' },
              { href: '/admin/prospective_students', icon: UserPlus, label: 'Calon Santri' },
              { href: '/admin/attendance', icon: CalendarCheck, label: 'Absensi' },
              { href: '/admin/teachers', icon: GraduationCap, label: 'Ustad' },
              { href: '/admin/profile', icon: User, label: 'Profil' },
              { href: '/admin/pis-assistant', icon: Bot, label: 'PIS Assistant' },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={handleLinkClick}
                className={cn(
                  'group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200',
                  'hover:bg-white/10 active:scale-[0.98]',
                  pathname === href 
                    ? 'bg-white/15 text-white shadow-lg shadow-emerald-900/20' 
                    : 'text-emerald-100/70 hover:text-white'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-5 h-5 mr-3',
                  'transition-transform duration-200',
                  'group-hover:scale-110',
                  pathname === href && 'transform scale-110'
                )}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <span className="text-sm font-medium">{label}</span>
                {pathname === href && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Fixed logout button at bottom of sidebar */}
        <div className="sticky bottom-0 p-4 bg-emerald-800 border-t border-emerald-700/50">
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-3 py-2.5',
              'bg-red-500 hover:bg-red-600 active:bg-red-700',
              'text-white font-medium',
              'rounded-xl transition-all duration-200',
              'shadow-lg'
            )}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay untuk menutup sidebar saat klik di luar */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default AdminSidebar;
