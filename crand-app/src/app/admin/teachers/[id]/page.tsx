'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTeacherById } from '../action';
import Link from 'next/link';
import EditTeacherModal from './EditTeacherModal';

interface TeacherDetail {
  _id: string;
  nip: string;
  user?: {
    name: string;
    email: string;
    phone_number: string;
    profile_picture: string;
    role: string;
  };
}

const TeacherDetailPage = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      if (!id) return;
      const response = await getTeacherById(id as string);
      const data = JSON.parse(response);
      setTeacher(data);
    };

    fetchTeacher();
  }, [id]);

  if (!teacher) {
    return (
      <div className="p-10 text-center text-gray-600">Memuat data ustadz...</div>
    );
  }

  return (
    <div className="p-8 bg-[#9ACBD0] min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl p-8 mt-12">
        <h1 className="text-3xl font-bold text-[#006A71] mb-6">
          Detail Ustadz
        </h1>

        <div className="flex gap-6">
          {teacher.user?.profile_picture && (
            <img
              src={teacher.user.profile_picture}
              alt={teacher.user.name}
              className="w-32 h-32 rounded-full object-cover border-2 border-[#48A6A7]"
            />
          )}

          <div className="space-y-4 text-lg">
            <p><strong>Nama:</strong> {teacher.user?.name || '-'}</p>
            <p><strong>NIP:</strong> {teacher.nip}</p>
            <p><strong>Email:</strong> {teacher.user?.email || '-'}</p>
            <p><strong>No. HP:</strong> {teacher.user?.phone_number || '-'}</p>
            <p><strong>Role:</strong> {teacher.user?.role || '-'}</p>
          </div>
        </div>

        <Link
          href="/admin/teachers"
          className="inline-block mt-8 px-6 py-2 bg-[#48A6A7] text-white rounded-lg hover:bg-[#3e9394] m-5"
        >
          Kembali
        </Link>
      <EditTeacherModal teacher={teacher} onUpdated={() => window.location.reload()} />
      </div>
    </div>
  );
};

export default TeacherDetailPage;
