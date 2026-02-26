export interface ShiftSchedule {
  start: number;
  end: number;
}

export interface DaySchedule {
  [key: number]: ShiftSchedule[];
}

export const SHIFT_SCHEDULES: DaySchedule = {
  0: [], // Minggu - Libur
  1: [ // Senin
    { start: 240, end: 285 },  // 04:00 - 04:45
    { start: 360, end: 420 },  // 06:00 - 07:00
    { start: 480, end: 540 },  // 08:00 - 09:00
    { start: 960, end: 1035 }, // 16:00 - 17:15
  ],
  2: [ // Selasa
    { start: 240, end: 285 },  // 04:00 - 04:45
    { start: 360, end: 420 },  // 06:00 - 07:00
    { start: 480, end: 540 },  // 08:00 - 09:00
    { start: 1110, end: 1200 }, // 18:30 - 20:00
  ],
  3: [ // Rabu
    { start: 240, end: 285 },  // 04:00 - 04:45
    { start: 360, end: 420 },  // 06:00 - 07:00
    { start: 480, end: 540 },  // 08:00 - 09:00
    { start: 1110, end: 1200 }, // 18:30 - 20:00
  ],
  4: [ // Kamis
    { start: 240, end: 285 },  // 04:00 - 04:45
    { start: 360, end: 420 },  // 06:00 - 07:00
    { start: 480, end: 540 },  // 08:00 - 09:00
    { start: 960, end: 1035 }, // 16:00 - 17:15
  ],
  5: [ // Jumat
    { start: 240, end: 285 },  // 04:00 - 04:45
    { start: 360, end: 420 },  // 06:00 - 07:00
    { start: 480, end: 540 },  // 08:00 - 09:00
    { start: 1110, end: 1200 }, // 18:30 - 20:00
  ],
  6: [ // Sabtu
    { start: 240, end: 285 },  // 04:00 - 04:45
    { start: 360, end: 420 },  // 06:00 - 07:00
  ],
};

type ShiftTimeKey = '240-285' | '360-420' | '480-540' | '960-1035' | '1110-1200';

export const SHIFT_TIMES: Record<ShiftTimeKey, string> = {
  '240-285': '04:00 - 04:45',
  '360-420': '06:00 - 07:00',
  '480-540': '08:00 - 09:00',
  '960-1035': '16:00 - 17:15',
  '1110-1200': '18:30 - 20:00',
};

// ===== Jadwal berbasis peran =====
export type Role = 'teacher' | 'admin' | 'hrd' | 'educator' | 'manager' | 'adminhrd' | 'kepengasuhan' | 'staff';

type AdminShiftKey = '480-990';
const ADMIN_TIMES: Record<AdminShiftKey, string> = {
  '480-990': '08:00 - 16:30',
};

type EducatorShiftKey = '555-600' | '600-645' | '660-705' | '705-750';
const EDUCATOR_TIMES: Record<EducatorShiftKey, string> = {
  '555-600': 'Jam 1 09:15 - 10:00',
  '600-645': 'Jam 2 10:00 - 10:45',
  '660-705': 'Jam 3 11:00 - 11:45',
  '705-750': 'Jam 4 11:45 - 12:30',
};

const ADMIN_SCHEDULES: DaySchedule = {
  0: [],
  1: [ { start: 480, end: 990 } ],
  2: [ { start: 480, end: 990 } ],
  3: [ { start: 480, end: 990 } ],
  4: [ { start: 480, end: 990 } ],
  5: [ { start: 480, end: 990 } ],
  6: [ { start: 480, end: 990 } ],
};

const EDUCATOR_SCHEDULES: DaySchedule = {
  0: [],
  1: [ { start: 555, end: 600 }, { start: 600, end: 645 }, { start: 660, end: 705 }, { start: 705, end: 750 } ],
  2: [ { start: 555, end: 600 }, { start: 600, end: 645 }, { start: 660, end: 705 }, { start: 705, end: 750 } ],
  3: [ { start: 555, end: 600 }, { start: 600, end: 645 }, { start: 660, end: 705 }, { start: 705, end: 750 } ],
  4: [ { start: 555, end: 600 }, { start: 600, end: 645 }, { start: 660, end: 705 }, { start: 705, end: 750 } ],
  5: [ { start: 555, end: 600 }, { start: 600, end: 645 }, { start: 660, end: 705 }, { start: 705, end: 750 } ],
  6: [ { start: 555, end: 600 }, { start: 600, end: 645 }, { start: 660, end: 705 }, { start: 705, end: 750 } ],
};

export function getSchedulesByRole(role: Role): DaySchedule {
  if (['admin', 'hrd', 'manager', 'adminhrd', 'staff'].includes(role)) return ADMIN_SCHEDULES;
  if (role === 'educator') return EDUCATOR_SCHEDULES;
  return SHIFT_SCHEDULES; // default teacher
}

export function getTimeLabelsByRole(role: Role): Record<string, string> {
  if (['admin', 'hrd', 'manager', 'adminhrd', 'staff'].includes(role)) return ADMIN_TIMES as unknown as Record<string, string>;
  if (role === 'educator') return EDUCATOR_TIMES as unknown as Record<string, string>;
  return SHIFT_TIMES as unknown as Record<string, string>;
}

function toJakartaDate(date: Date): Date {
  return new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );
}

export function getCurrentShift(date: Date = new Date()): string {
  const local = toJakartaDate(date);
  const hour = local.getHours();
  const minute = local.getMinutes();
  const currentTime = hour * 60 + minute;
  const dayOfWeek = local.getDay();

  // Jika hari Minggu
  if (dayOfWeek === 0) {
    return 'Libur';
  }

  // Cek jadwal untuk hari ini
  const todaySchedules = SHIFT_SCHEDULES[dayOfWeek];
  for (const schedule of todaySchedules) {
    if (currentTime >= schedule.start && currentTime <= schedule.end) {
      return SHIFT_TIMES[`${schedule.start}-${schedule.end}` as ShiftTimeKey];
    }
  }

  return 'Di luar jadwal';
}

export function getRoleCurrentShift(role: Role, date: Date = new Date()): string {
  const local = toJakartaDate(date);
  const hour = local.getHours();
  const minute = local.getMinutes();
  const currentTime = hour * 60 + minute;
  const dayOfWeek = local.getDay();

  if (dayOfWeek === 0) return 'Libur';

  const schedules = getSchedulesByRole(role);
  const labels = getTimeLabelsByRole(role);
  const today = schedules[dayOfWeek] || [];
  for (const s of today) {
    const key = `${s.start}-${s.end}`;
    if (currentTime >= s.start && currentTime <= s.end) {
      return labels[key] || 'Dalam jadwal';
    }
  }
  return 'Di luar jadwal';
}

export function getAttendanceBuffer(role: Role): number {
  // Teacher, Educator, Kepengasuhan: 15 menit
  if (role === 'teacher' || role === 'educator' || role === 'kepengasuhan') {
    return 15;
  }
  // Staff (admin, hrd, manager, adminhrd, staff): 1 jam (60 menit)
  return 60;
}

export function isValidAttendanceTime(
  date: Date = new Date(),
  role: Role = 'teacher',
  bufferMinutes?: number
): { isValid: boolean; message: string; isLate?: boolean; lateMinutes?: number; schedule?: ShiftSchedule } {
  const local = toJakartaDate(date);
  const hour = local.getHours();
  const minute = local.getMinutes();
  const currentTime = hour * 60 + minute;
  const dayOfWeek = local.getDay();

  // Determine buffer to use
  const effectiveBuffer = bufferMinutes !== undefined ? bufferMinutes : getAttendanceBuffer(role);

  // Minggu (0) libur
  if (dayOfWeek === 0) {
    return { isValid: false, message: 'Hari Minggu (Libur). Absensi tidak tersedia.' };
  }

  const schedules = getSchedulesByRole(role);
  const labels = getTimeLabelsByRole(role);
  const todaySchedules = schedules[dayOfWeek] || [];
  
  // Find active schedule considering EARLY buffer
  // User can clock in from (start - buffer) until end
  const active = todaySchedules.find(
    (s) => currentTime >= (s.start - effectiveBuffer) && currentTime <= s.end
  );

  if (active) {
    // Check if late (after start + tolerance usually, but here we just check validity first)
    // Assuming strict start time for "Late" calculation, but "Valid" includes buffer.
    // Let's assume late tolerance is standard (e.g. 15 mins after start) or just strict start.
    // For now, if they are in the window [start - buffer, end], it is VALID.
    
    // However, we should probably flag if they are late.
    // Common rule: Late if currentTime > start.
    // Let's keep it simple: Valid if within window.
    
    // Optional: Calculate lateness if needed by UI
    let isLate = false;
    let lateMinutes = 0;
    
    // If current time is past the start time + some tolerance (e.g. 0 or 15?)
    // User didn't specify late tolerance, only early buffer.
    // Standard practice: Late if > start.
    if (currentTime > active.start) {
       isLate = true;
       lateMinutes = currentTime - active.start;
    }

    return { 
      isValid: true, 
      message: 'Waktu absensi valid.',
      isLate,
      lateMinutes,
      schedule: active
    };
  }

  // Buat pesan informatif tentang jadwal hari ini
  const available = todaySchedules
    .map((s) => labels[`${s.start}-${s.end}`])
    .filter(Boolean);
  const scheduleMsg = available.length
    ? `Jadwal hari ini: ${available.join(', ')}`
    : 'Tidak ada jadwal absensi untuk hari ini.';

  return {
    isValid: false,
    message: `Di luar jadwal. ${scheduleMsg}`,
  };
}
