'use client';

import { cn } from '@/lib/utils';
import LogoutButton from './LogoutButton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, CalendarCheck, Bookmark, User, Bot, Menu, X } from 'lucide-react';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import { useState, useCallback, useEffect } from 'react';

const StudentSidebar = () => {
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
              <p className="text-[11px] text-emerald-200/80">Student Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <aside className={cn(
        'w-64 min-h-screen bg-emerald-800 flex flex-col transition-all duration-300 ease-in-out border-r border-emerald-700/50',
        'fixed inset-y-0 -left-64 lg:left-0 z-50',
        !isCollapsed && 'left-0'
      )}>
      <div className="flex flex-col flex-1 px-4 py-6 overflow-y-auto">
        <div className="flex items-center gap-3 px-2 mb-2 mt-6  ">
          <Image src={logo} alt="logo" className="w-16 h-16 rounded-lg" width={64} height={64} />
          <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white">CRAND</h1>
              <p className="text-[11px] text-emerald-200/80">Student Dashboard</p>
            </div>
        </div>

        <hr className="my-4 border-emerald-800/50" />

        <nav className="mt-2 space-y-2">
          {[
            { href: '/student', icon: Home, label: 'Dashboard' },
            { href: '/student/academic', icon: BookOpen, label: 'Akademik' },
            { href: '/student/attendance', icon: CalendarCheck, label: 'Absensi' },
            { href: '/student/memorization', icon: Bookmark, label: 'Hafalan' },
            { href: '/student/profile', icon: User, label: 'Profil' },
            { href: '/student/pis-assistant', icon: Bot, label: 'PIS Assistant' },
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

      <div className="sticky bottom-0 p-4 bg-emerald-800 border-t border-emerald-700/50 mt-auto">
        <LogoutButton
          className={cn(
            'w-full px-4 py-2.5 flex items-center justify-center gap-2',
            'bg-red-500/90 hover:bg-red-600 active:bg-red-700',
            'text-white font-medium',
            'rounded-xl transition-all duration-200',
            'shadow-lg hover:shadow-red-500/20',
            'backdrop-blur-sm'
          )}
          iconClassName="w-4 h-4"
        />
      </div>
    </aside>
      {/* Overlay untuk menutup sidebar saat klik di luar */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default StudentSidebar;
