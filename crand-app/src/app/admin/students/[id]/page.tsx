'use client';

import { useState, useEffect, use } from "react";
import { getStudentById } from "./action";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditStudentModal from "./EditStudentModal";
import { Student } from "@/types/student";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function StudentDetailPage({ params }: Props) {
  const { id } = use(params);
  const [student, setStudent] = useState<Student | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      const data = await getStudentById(id);
      if (!data) return notFound();
      setStudent({
        ...data,
        halaqah_id: data.halaqah_id || null // Ensure halaqah_id is string | null
      });
    };
    fetchStudent();
  }, [id]);

  if (!student) return <div className="p-8 text-center text-gray-600">Loading data santri...</div>;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mt-10">
        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-center text-emerald-800 mb-10 tracking-wide">
          📘 Detail Santri
        </h1>

        {/* Profil Santri */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Image
            src={student.profile_picture}
            alt={student.name}
            width={140}
            height={140}
            className="rounded-full border-4 border-emerald-800 shadow-md object-cover"
          />
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-emerald-800">{student.name}</h2>
            <p className="text-gray-600 mt-1 text-sm">NISN: {student.nisn}</p>
            <p className="text-gray-600 text-sm">{student.email}</p>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-4 mt-8 justify-center md:justify-start">
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-full shadow-md transition"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => alert("Handler hapus belum dibuat")}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-full shadow-md transition"
          >
            🗑️ Hapus
          </button>
        </div>

        {/* Informasi Lengkap */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px]">
          <Info label="Jenis Kelamin" value={student.gender} />
          <Info label="Tempat, Tanggal Lahir" value={student.birth_place_date} />
          <Info label="No. HP" value={student.phone_number} />
          <Info label="Alamat" value={student.address} />
          <Info label="Nama Ayah" value={student.father_name} />
          <Info label="Nama Ibu" value={student.mother_name} />
          <Info label="Tahun Akademik" value={student.academic_year} />
          <Info label="Tingkat Akademik" value={student.academic_level} />
          <Info label="Program" value={student.program} />
          <Info label="Kelas" value={student.class_name} />
          <Info label="Halaqah" value={student.halaqah} />
          <Info label="Level" value={student.level} />
          <Info label="VA SPP" value={student.VA_SPP} />
          <Info label="Ekskul" value={student.ekskul} />
          <Info label="Status" value={student.graduation_status} />
        </div>

        {/* Tombol Kembali */}
        <div className="mt-12 text-center">
          <Link
            href="/admin/students"
            className="inline-block bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-5 py-2 rounded-full shadow-sm text-sm transition"
          >
            ← Kembali ke daftar santri
          </Link>
        </div>
      </div>

      {/* Modal Edit */}
      {showEditModal && (
        <EditStudentModal
          student={student}
          onClose={() => setShowEditModal(false)}
          onUpdated={async () => {
            if (!student) return;
            const updated = await getStudentById(student._id);
            setStudent(updated as Student);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-base text-gray-800 font-semibold">{value || "-"}</p>
    </div>
  );
}
