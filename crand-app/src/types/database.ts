import { ObjectId } from "mongodb";

export interface Student {
  _id: ObjectId;
  name: string;
  class: string;
  status: "active" | "inactive" | "graduated";
  enrollmentDate: Date;
  dateOfBirth: Date;
  gender: "L" | "P";
  address: string;
  parentName: string;
  parentContact: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  _id: ObjectId;
  studentId: ObjectId;
  title: string;
  description?: string;
  category: "academic" | "non-academic" | "religious" | "other";
  level: "school" | "district" | "province" | "national" | "international";
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicRecord {
  _id: ObjectId;
  studentId: ObjectId;
  semester: string;
  year: number;
  subjects: {
    name: string;
    grade: number;
    notes?: string;
  }[];
  average: number;
  rank?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherAttendance {
  _id: ObjectId;
  teacher_id: ObjectId;
  date: Date;
  photo: string;
  face_descriptor: number[];
  created_at: Date;
  updated_at: Date;
}

export interface AdminAttendance {
  _id: ObjectId;
  admin_id: ObjectId;
  date: Date;
  photo: string;
  face_descriptor: number[];
  created_at: Date;
  updated_at: Date;
}

export interface StudentAttendance {
  _id: ObjectId;
  student_id: ObjectId;
  date: Date;
  status: "present" | "absent" | "sick" | "permission";
  created_at: Date;
  updated_at: Date;
}
