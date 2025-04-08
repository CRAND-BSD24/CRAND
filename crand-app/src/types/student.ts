export interface Student {
  _id: string;
  name: string;
  email: string;
  nisn: string;
  gender: string;
  address: string;
  father_name: string;
  mother_name: string;
  academic_year: string;
  academic_level: string;
  program: string;
  level: string;
  class_id: string;
  ekskul: string;
  graduation_status: string;
  payment_status: string;
  phone_number: string | null;
  VA_SPP: string;
  birth_place_date: string;
  profile_picture: string;
  halaqah_id: string;
}


export type StudentUpdate = Partial<Omit<Student, "_id">>;