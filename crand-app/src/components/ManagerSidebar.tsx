'use client';

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Home, CalendarCheck, GraduationCap, Menu, X, LogOut, BookOpen, User } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import logo from "@/assets/logo.png";
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { logout } from '@/app/actions/auth';

const ManagerSidebar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLinkClick = useCallback(() => {
    if (window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Berhasil logout");
      await signOut({ redirect: true, callbackUrl: '/logout' });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Gagal logout, silakan coba lagi");
    }
  };

  useEffect(() => {
    handleLinkClick();
  }, [pathname, handleLinkClick]);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-blue-800 border-b border-blue-700/50 z-50 flex items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-white hover:bg-blue-700/50 active:bg-blue-700 transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <Image src={session?.user?.image || logo} alt="logo" className="w-8 h-8 rounded-lg object-cover" width={32} height={32} priority />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white truncate max-w-[150px]">Ibnu Syam</h1>
              <p className="text-[11px] text-blue-200/80">Manager Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <aside className={cn(
        'w-64 min-h-screen bg-blue-800 flex flex-col transition-all duration-300 ease-in-out border-r border-blue-700/50',
        'fixed inset-y-0 -left-64 lg:left-0 z-50',
        !isCollapsed && 'left-0'
      )}>
        <div className="flex flex-col flex-1 px-4 py-6 overflow-y-auto">
          <div className="flex items-center gap-3 px-2 mb-2 mt-6">
            <Image src={session?.user?.image || logo} alt="logo" className="w-16 h-16 rounded-lg object-cover" width={64} height={64} />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white truncate max-w-[150px]">Ibnu Syam</h1>
              <p className="text-xs text-blue-200/80">Manager Dashboard</p>
            </div>
          </div>

          <hr className="my-4 border-blue-800/50" />

          <nav className="mt-2 space-y-2">
            {[
              { href: '/manager', icon: Home, label: 'Dashboard' },
              { href: '/manager/attendance', icon: CalendarCheck, label: 'Absensi' },
              { href: '/manager/leaves', icon: BookOpen, label: 'Perizinan' },
              { href: '/manager/bisyaroh', icon: GraduationCap, label: 'Bisyaroh' },
              { href: '/manager/profile', icon: User, label: 'Profil' },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={handleLinkClick}
                className={cn(
                  'group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200',
                  'hover:bg-white/10 active:scale-[0.98]',
                  pathname === href 
                    ? 'bg-white/15 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-blue-100/70 hover:text-white'
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
              </Link>
            ))}
          </nav>

          <div className="mt-4 lg:mt-auto lg:pb-4">
            <button
              onClick={handleLogout}
              className={cn(
                'w-full px-4 py-2.5 flex items-center justify-center gap-2',
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
        </div>
      </aside>

      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default ManagerSidebar;
