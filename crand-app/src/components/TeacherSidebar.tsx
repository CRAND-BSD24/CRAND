'use client';

import { cn } from "@/lib/utils";
import LogoutButton from "./LogoutButton";
import logo from "@/assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Home, BookOpen, CalendarCheck, Book, User, Bot, Menu, X } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

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

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-emerald-800 border-b border-emerald-700/50 z-50 flex items-center justify-between px-3 sm:px-4 lg:hidden">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 sm:p-2 rounded-lg text-white hover:bg-emerald-700/50 active:bg-emerald-700 transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <Image src={logo} alt="logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" width={40} height={40} priority />
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-bold text-white">CRAND</h1>
              <p className="text-[10px] sm:text-xs text-emerald-200/80">Teacher Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <aside className={cn(
        'fixed lg:sticky top-0 left-0 w-64 h-screen bg-emerald-800 flex flex-col transition-all duration-300 ease-in-out border-r border-emerald-700/50 z-40',
        isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
      )}>
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center gap-3 px-4 h-16 border-b border-emerald-700/50">
          <Image src={logo} alt="logo" className="w-10 h-10 rounded-lg" width={40} height={40} priority />
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
                  'group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200',
                  'hover:bg-white/10 active:scale-[0.98]',
                  pathname === href 
                    ? 'bg-white/15 text-white' 
                    : 'text-emerald-100/70 hover:text-white'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-5 h-5 mr-3',
                  'transition-transform duration-200',
                  'group-hover:scale-110',
                  pathname === href && 'transform scale-110'
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{label}</span>
                {pathname === href && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 mt-auto border-t border-emerald-700/50" onClick={handleLinkClick}>
          <LogoutButton
            className={cn(
              'w-full flex items-center justify-center gap-2 px-3 py-2.5',
              'bg-white/10 hover:bg-white/15 active:bg-white/20',
              'text-emerald-100/70 hover:text-white',
              'rounded-xl transition-all duration-200',
              'shadow-lg shadow-emerald-900/10',
              'backdrop-blur-sm'
            )}
            iconClassName="w-4 h-4"
          />
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
