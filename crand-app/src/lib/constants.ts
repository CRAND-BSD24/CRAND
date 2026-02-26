export const ROLES = [
  'admin',
  'teacher',
  'student',
  'hrd',
  'educator',
  'manager',
  'adminhrd',
  'kepengasuhan',
  'staff'
] as const;

export type Role = typeof ROLES[number];
