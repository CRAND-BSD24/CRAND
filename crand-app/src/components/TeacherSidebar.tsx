'use client';

import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Home, BookOpen, CalendarCheck, Book, User, Bot, Menu, X, LogOut } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { logout } from '@/app/actions/auth';

const TeacherSidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLinkClick = useCallback(() => {
    // Only close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    handleLinkClick();
  }, [pathname, handleLinkClick]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Berhasil logout");
      await signOut({
        redirect: false,
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Gagal logout, silakan coba lagi");
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-emerald-800 border-b border-emerald-700/50 z-50 flex items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-white hover:bg-emerald-700/50 active:bg-emerald-700 transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <Image src={logo} alt="logo" className="w-8 h-8 rounded-lg" width={32} height={32} priority />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white">CRAND</h1>
              <p className="text-xs text-emerald-200/80">Teacher Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <aside className={cn(
        'fixed lg:sticky top-0 left-0 w-64 h-screen bg-emerald-800 flex flex-col transition-all duration-300 ease-in-out z-40',
        isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
      )}>
        {/* Desktop Header */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-emerald-700/50">
          <Image src={logo} alt="logo" className="w-8 h-8 rounded" width={32} height={32} priority />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white">CRAND</h1>
            <p className="text-xs text-emerald-200/80">Teacher Dashboard</p>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-4 overflow-y-auto">
          <nav className="space-y-1.5">
            {[
              { href: '/teacher', icon: Home, label: 'Dashboard' },
              { href: '/teacher/academic', icon: BookOpen, label: 'Akademik' },
              { href: '/teacher/attendance', icon: CalendarCheck, label: 'Absensi' },
              { href: '/teacher/memorization', icon: Book, label: 'Hafalan' },
              { href: '/teacher/profile', icon: User, label: 'Profil' },
              { href: '/teacher/pis-assistant', icon: Bot, label: 'PIS Assistant' },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={handleLinkClick}
                className={cn(
                  'group flex items-center px-3 py-2 rounded-md transition-all duration-200',
                  pathname === href 
                    ? 'bg-white/10 text-white' 
                    : 'text-emerald-100/80 hover:bg-white/5 hover:text-white'
                )}
              >
                <div className="flex items-center justify-center w-5 h-5 mr-3">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 mt-auto" onClick={handleLinkClick}>
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 rounded-md text-emerald-100/80 hover:bg-white/5 hover:text-white transition-all duration-200 w-full"
          >
            <div className="flex items-center justify-center w-5 h-5 mr-3">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Logout</span>
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

export default TeacherSidebar;
