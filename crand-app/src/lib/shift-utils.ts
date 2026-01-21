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
    { start: 330, end: 420 },  // 05:30 - 07:00
    { start: 480, end: 540 },  // 08:00 - 09:00
    { start: 960, end: 1035 }, // 16:00 - 17:15
  ],
  2: [ // Selasa
    { start: 240, end: 285 },  // 04:00 - 04:45
    { start: 330, end: 420 },  // 05:30 - 07:00
    { start: 480, end: 540 },  // 08:00 - 09:00
    { start: 1110, end: 1200 }, // 18:30 - 20:00
  ],
  3: [ // Rabu
    { start: 240, end: 285 },  // 04:00 - 04:45
    { start: 330, end: 420 },  // 05:30 - 07:00
    { start: 480, end: 540 },  // 08:00 - 09:00
    { start: 1110, end: 1200 }, // 18:30 - 20:00
  ],
  4: [ // Kamis
    { start: 240, end: 285 },  // 04:00 - 04:45
    { start: 330, end: 420 },  // 05:30 - 07:00
    { start: 480, end: 540 },  // 08:00 - 09:00
    { start: 960, end: 1035 }, // 16:00 - 17:15
  ],
  5: [ // Jumat
    { start: 240, end: 285 },  // 04:00 - 04:45
    { start: 330, end: 420 },  // 05:30 - 07:00
    { start: 480, end: 540 },  // 08:00 - 09:00
    { start: 1110, end: 1200 }, // 18:30 - 20:00
  ],
  6: [ // Sabtu
    { start: 240, end: 285 },  // 04:00 - 04:45
    { start: 330, end: 420 },  // 05:30 - 07:00
    { start: 480, end: 540 },  // 08:00 - 09:00
  ],
};

type ShiftTimeKey = '240-285' | '330-420' | '480-540' | '960-1035' | '1110-1200';

export const SHIFT_TIMES: Record<ShiftTimeKey, string> = {
  '240-285': '04:00 - 04:45',
  '330-420': '05:30 - 07:00',
  '480-540': '08:00 - 09:00',
  '960-1035': '16:00 - 17:15',
  '1110-1200': '18:30 - 20:00',
};

// ===== Jadwal berbasis peran =====
export type Role = 'teacher' | 'admin' | 'hrd' | 'educator';

type AdminShiftKey = '480-960' | '960-1020';
const ADMIN_TIMES: Record<AdminShiftKey, string> = {
  '480-960': 'Berangkat 08:00 - 16:00',
  '960-1020': 'Pulang 16:00 - 17:00',
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
  1: [ { start: 480, end: 960 }, { start: 960, end: 1020 } ],
  2: [ { start: 480, end: 960 }, { start: 960, end: 1020 } ],
  3: [ { start: 480, end: 960 }, { start: 960, end: 1020 } ],
  4: [ { start: 480, end: 960 }, { start: 960, end: 1020 } ],
  5: [ { start: 480, end: 960 }, { start: 960, end: 1020 } ],
  6: [ { start: 480, end: 960 }, { start: 960, end: 1020 } ],
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

function getSchedulesByRole(role: Role): DaySchedule {
  if (role === 'admin' || role === 'hrd') return ADMIN_SCHEDULES;
  if (role === 'educator') return EDUCATOR_SCHEDULES;
  return SHIFT_SCHEDULES; // default teacher
}

function getTimeLabelsByRole(role: Role): Record<string, string> {
  if (role === 'admin' || role === 'hrd') return ADMIN_TIMES as unknown as Record<string, string>;
  if (role === 'educator') return EDUCATOR_TIMES as unknown as Record<string, string>;
  return SHIFT_TIMES as unknown as Record<string, string>;
}

export function getCurrentShift(date: Date = new Date()): string {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const currentTime = hour * 60 + minute;
  const dayOfWeek = date.getDay();

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
  const hour = date.getHours();
  const minute = date.getMinutes();
  const currentTime = hour * 60 + minute;
  const dayOfWeek = date.getDay();

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

export function isValidAttendanceTime(
  date: Date = new Date(),
  role: Role = 'teacher',
  bufferMinutes: number = 0
): { isValid: boolean; message: string; isLate?: boolean; lateMinutes?: number } {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const currentTime = hour * 60 + minute;
  const dayOfWeek = date.getDay();

  // Minggu (0) libur
  if (dayOfWeek === 0) {
    return { isValid: false, message: 'Hari Minggu (Libur). Absensi tidak tersedia.' };
  }

  const schedules = getSchedulesByRole(role);
  const labels = getTimeLabelsByRole(role);
  const todaySchedules = schedules[dayOfWeek] || [];
  const active = todaySchedules.find(
    (s) => currentTime >= s.start && currentTime <= s.end
  );

  if (active) {
    // Deteksi keterlambatan: berlaku untuk semua peran kecuali window "pulang" admin/hrd
    let isLate = false;
    let lateMinutes = 0;
    const isAdminDepartureWindow = (role === 'admin' || role === 'hrd') && active.start === 960 && active.end === 1020;
    if (!isAdminDepartureWindow && bufferMinutes > 0) {
      const threshold = active.start + bufferMinutes; // menit dari 00:00
      if (currentTime > threshold) {
        isLate = true;
        lateMinutes = currentTime - threshold;
      }
    }

    return {
      isValid: true,
      message: isLate ? `Waktu absensi valid (Terlambat ${lateMinutes} menit).` : 'Waktu absensi valid.',
      isLate,
      lateMinutes,
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