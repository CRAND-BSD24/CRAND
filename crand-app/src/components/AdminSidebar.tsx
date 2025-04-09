'use client';

import { cn } from "@/lib/utils";
import LogoutButton from "./LogoutButton";
import logo from "@/assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Home, Users, UserPlus, CalendarCheck, GraduationCap, BookOpen, User, Bot } from 'lucide-react';

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className={cn('w-64 min-h-screen bg-emerald-800 flex flex-col transition-all duration-300 ease-in-out border-r border-emerald-700/50')}>
      <div className="flex flex-col flex-1 px-4 py-6">
        <div className="flex items-center gap-3 px-2 mb-2 mt-6">
          <Image src={logo} alt="logo" className="w-16 h-16 rounded-lg" width={64} height={64} />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white">CRAND</h1>
            <p className="text-xs text-emerald-200/80">Admin Dashboard</p>
          </div>
        </div>

        <hr className="my-4 border-emerald-800/50" />

        <nav className="mt-2 space-y-2">
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

      <div className="p-4 mt-auto">
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
  );
};

export default AdminSidebar;
