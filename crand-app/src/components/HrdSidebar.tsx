'use client';

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Wallet, Home, Menu, X, LogOut, CalendarCheck, GraduationCap, ChevronDown, ChevronRight, Building2, FileText, CalendarDays, Users, Briefcase, Plane, UserCog, Trash2, Clock, ListChecks, Calendar, BadgeCheck, Scissors, Timer, Sun, Settings, FlaskConical, User } from 'lucide-react';
import { useCallback, useEffect, useState } from "react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";
import { logout } from '@/app/actions/auth';
import { signOut, useSession } from 'next-auth/react';

const HrdSidebar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [ustadzOpen, setUstadzOpen] = useState(false);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [masterOpen, setMasterOpen] = useState(false);

  const handleLinkClick = useCallback(() => {
    if (window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
  }, []);

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
              <h1 className="text-lg font-bold text-white truncate max-w-[150px]">{session?.user?.name || 'Ibnu Syam'}</h1>
              <p className="text-[11px] text-blue-200/80">{session?.user?.role === 'adminhrd' ? 'Admin HRD Dashboard' : 'HRD Dashboard'}</p>
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
              <h1 className="text-lg font-bold text-white truncate max-w-[180px]">{session?.user?.name || 'Ibnu Syam'}</h1>
              <p className="text-xs text-blue-200/80">{session?.user?.role === 'adminhrd' ? 'Admin HRD Dashboard' : 'HRD Dashboard'}</p>
            </div>
          </div>

          <hr className="my-4 border-blue-800/50" />

          <nav className="mt-2 space-y-2">
            {/* Dashboard */}
            <Link
              href={session?.user?.role === 'adminhrd' ? '/adminhrd' : '/hrd'}
              className={cn(
                'group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200',
                'hover:bg-white/10 active:scale-[0.98]',
                (pathname === '/hrd' || pathname === '/adminhrd') ? 'bg-white/15 text-white shadow-lg shadow-blue-900/20' : 'text-blue-100/70 hover:text-white'
              )}
            >
              <div className="flex items-center justify-center w-5 h-5 mr-3 group-hover:scale-110 transition-transform"><Home className="w-[18px] h-[18px]" /></div>
              <span className="text-sm font-medium">Dashboard</span>
              {(pathname === '/hrd' || pathname === '/adminhrd') && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>

            {/* Profile */}
            <Link
              href={session?.user?.role === 'adminhrd' ? '/adminhrd/profile' : '/hrd/profile'}
              className={cn(
                'group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200',
                'hover:bg-white/10 active:scale-[0.98]',
                (pathname === '/hrd/profile' || pathname === '/adminhrd/profile') ? 'bg-white/15 text-white shadow-lg shadow-blue-900/20' : 'text-blue-100/70 hover:text-white'
              )}
            >
              <div className="flex items-center justify-center w-5 h-5 mr-3 group-hover:scale-110 transition-transform"><User className="w-[18px] h-[18px]" /></div>
              <span className="text-sm font-medium">Profil</span>
              {(pathname === '/hrd/profile' || pathname === '/adminhrd/profile') && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>

            {/* Penggajian group */}
            {session?.user?.role !== 'adminhrd' && (
              <>
                <button
                  onClick={() => setSalaryOpen((v) => !v)}
                  className={cn(
                    'w-full group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200',
                    'hover:bg-white/10 active:scale-[0.98] text-blue-100/70 hover:text-white'
                  )}
                >
                  <div className="flex items-center justify-center w-5 h-5 mr-3 group-hover:scale-110 transition-transform"><Wallet className="w-[18px] h-[18px]" /></div>
                  <span className="text-sm font-medium">Penggajian</span>
                  <div className="ml-auto text-blue-200">{salaryOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</div>
                </button>
                {salaryOpen && (
                  <div className="ml-6 space-y-1">
                    <Link href="/hrd/salaries" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/salaries' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Wallet className="w-4 h-4 mr-2" /> Daftar Gaji Pokok</Link>
                    <Link href="/hrd/teacherSalaries" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/teacherSalaries' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Wallet className="w-4 h-4 mr-2" /> Gaji & Tunjangan Tetap Ustadz</Link>
                    <Link href="/hrd/teacherFixedCuts" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/teacherFixedCuts' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Wallet className="w-4 h-4 mr-2" /> Potongan Tetap Ustadz</Link>
                    <Link href="/hrd/payrolls" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/payrolls' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Wallet className="w-4 h-4 mr-2" /> Hitung Gaji</Link>
                    <Link href="/hrd/payrollBonuses" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/payrollBonuses' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Wallet className="w-4 h-4 mr-2" /> Hitung Bonus</Link>
                    <Link href="/hrd/additionalSalaries" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/additionalSalaries' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Wallet className="w-4 h-4 mr-2" /> THR/Gaji 14/Gaji 15</Link>
                    <Link href="/hrd/weeklyPayrolls" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/weeklyPayrolls' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Wallet className="w-4 h-4 mr-2" /> Hitung Gaji Mingguan</Link>
                    <Link href="/hrd/hourPayrolls" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/hourPayrolls' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Wallet className="w-4 h-4 mr-2" /> Hitung Gaji Perjam</Link>
                  </div>
                )}
              </>
            )}

            {/* Absensi */}
            <Link
              href="/hrd/attendance"
              className={cn(
                'group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200',
                'hover:bg-white/10 active:scale-[0.98]',
                pathname?.startsWith('/hrd/attendance') ? 'bg-white/15 text-white shadow-lg shadow-blue-900/20' : 'text-blue-100/70 hover:text-white'
              )}
            >
              <div className="flex items-center justify-center w-5 h-5 mr-3 group-hover:scale-110 transition-transform"><CalendarCheck className="w-[18px] h-[18px]" /></div>
              <span className="text-sm font-medium">Absensi</span>
              {pathname?.startsWith('/hrd/attendance') && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>

            {/* Ustadz group */}
            <button
              onClick={() => setUstadzOpen((v) => !v)}
              className={cn(
                'w-full group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200',
                'hover:bg-white/10 active:scale-[0.98] text-blue-100/70 hover:text-white'
              )}
            >
              <div className="flex items-center justify-center w-5 h-5 mr-3 group-hover:scale-110 transition-transform"><GraduationCap className="w-[18px] h-[18px]" /></div>
              <span className="text-sm font-medium">Ustadz</span>
              <div className="ml-auto text-blue-200">{ustadzOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</div>
            </button>
            {ustadzOpen && (
              <div className="ml-6 space-y-1">
                <Link href="/hrd/teachers" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/teachers' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Users className="w-4 h-4 mr-2" /> Ustadz</Link>
                <Link href="/hrd/teachDepts" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/teachDepts' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Building2 className="w-4 h-4 mr-2" /> Ustadz Departemen</Link>
                <Link href="/hrd/teacherContracts" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/teacherContracts' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <FileText className="w-4 h-4 mr-2" /> Kontrak Ustadz</Link>
                <Link href="/hrd/teacherEvents" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/teacherEvents' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <CalendarDays className="w-4 h-4 mr-2" /> Kegiatan Ustadz</Link>
                <Link href="/hrd/teacherVisits" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/teacherVisits' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Plane className="w-4 h-4 mr-2" /> Kunjungan Ustadz</Link>
                <Link href="/hrd/teacherUsers" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/teacherUsers' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <UserCog className="w-4 h-4 mr-2" /> Akun Ustadz</Link>
                <Link href="/hrd/teacherShifts/shift-list" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname?.startsWith('/hrd/teacherShifts') ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Clock className="w-4 h-4 mr-2" /> Shift Ustadz</Link>
                <Link href="/hrd/deleteTeachers" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/deleteTeachers' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Trash2 className="w-4 h-4 mr-2" /> Permintaan Hapus Akun</Link>
              </div>
            )}

            {/* Master Data group */}
            <button
              onClick={() => setMasterOpen((v) => !v)}
              className={cn(
                'w-full group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200',
                'hover:bg-white/10 active:scale-[0.98] text-blue-100/70 hover:text-white'
              )}
            >
              <div className="flex items-center justify-center w-5 h-5 mr-3 group-hover:scale-110 transition-transform"><Briefcase className="w-[18px] h-[18px]" /></div>
              <span className="text-sm font-medium">Master Data</span>
              <div className="ml-auto text-blue-200">{masterOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</div>
            </button>
            {masterOpen && (
              <div className="ml-6 space-y-1">
                <Link href="/hrd/taskMasters" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/taskMasters' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <ListChecks className="w-4 h-4 mr-2" /> Penugasan Rutin</Link>
                <Link href="/hrd/leaveCategories" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/leaveCategories' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Calendar className="w-4 h-4 mr-2" /> Kategori Cuti</Link>
                <Link href="/hrd/kpiCategories" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/kpiCategories' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <BadgeCheck className="w-4 h-4 mr-2" /> Kategori Penilaian</Link>
                <Link href="/hrd/fixedAllowances" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/fixedAllowances' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Wallet className="w-4 h-4 mr-2" /> Tunjangan Tetap</Link>
                <Link href="/hrd/fixedCuts" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/fixedCuts' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Scissors className="w-4 h-4 mr-2" /> Potongan Tetap</Link>
                <Link href="/hrd/latePenaltyTiers" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/latePenaltyTiers' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Timer className="w-4 h-4 mr-2" /> Denda Keterlambatan Bertingkat</Link>
                <Link href="/hrd/jobs" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/jobs' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Briefcase className="w-4 h-4 mr-2" /> Jabatan</Link>
                <Link href="/hrd/shifts" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/shifts' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Clock className="w-4 h-4 mr-2" /> Skenario Jam Kerja</Link>
                <Link href="/hrd/holidays" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/holidays' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Sun className="w-4 h-4 mr-2" /> Waktu Libur</Link>
                <Link href="/hrd/users/pic" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname?.startsWith('/hrd/users/pic') ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <UserCog className="w-4 h-4 mr-2" /> Akun Penanggung Jawab</Link>
                <Link href="/hrd/settings/index" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/settings/index' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <Settings className="w-4 h-4 mr-2" /> Pengaturan</Link>
                <Link href="/hrd/experimental-settings/index" className={cn('flex items-center px-3 py-2 rounded-lg text-sm', pathname === '/hrd/experimental-settings/index' ? 'bg-white/10 text-white' : 'text-blue-100/70 hover:text-white')}> <FlaskConical className="w-4 h-4 mr-2" /> Pengaturan (Eksperimental)</Link>
              </div>
            )}
          </nav>

          <div className="mt-4 pt-2 lg:mt-auto lg:pb-4">
            <button
              onClick={async () => {
                try {
                  await logout();
                  toast.success('Berhasil logout');
                  await signOut({ redirect: true, callbackUrl: '/logout' });
                } catch (e) {
                  console.error('Logout error:', e);
                  toast.error('Gagal logout, silakan coba lagi');
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-red-500 hover:bg-red-600 active:bg-red-700 text-white transition-all shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default HrdSidebar;
