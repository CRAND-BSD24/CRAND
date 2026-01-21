'use client';

import { useState, useEffect, use } from "react";
import { getStudentById, deleteStudentById } from "./action";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import EditStudentModal from "./EditStudentModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { Student } from "@/types/student";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function StudentDetailPage({ params }: Props) {
  const { id } = use(params);
  const [student, setStudent] = useState<Student | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'family'>('personal');
  const router = useRouter();

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

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    const success = await deleteStudentById(id);
    if (success) {
      toast.success("Santri berhasil dihapus", {
        position: "top-right",
        autoClose: 3000,
      });
      router.push("/admin/students");
      router.refresh();
    } else {
      toast.error("Gagal menghapus santri", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    setShowDeleteModal(false);
  };

  if (!student) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 pt-20 lg:pt-8">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-800 mb-4"></div>
        <p className="text-lg text-emerald-800 font-medium">Memuat data santri...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen p-4 sm:p-8 pt-20 lg:pt-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-8 mb-8 relative z-0">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/admin/students"
            className="inline-flex items-center text-emerald-800 hover:text-emerald-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali
          </Link>
          <div className="flex gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Hapus
            </button>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-emerald-800 mb-8">
          Detail Santri
        </h1>

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 sm:p-6 mb-8 shadow-md">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Image
                src={student.profile_picture || "/images/default-avatar.png"}
                alt={student.name}
                width={160}
                height={160}
                className="rounded-full border-4 border-emerald-800 shadow-lg object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-emerald-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                {student.graduation_status || "Aktif"}
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-800">{student.name}</h2>
              <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                <div className="flex items-center gap-1 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm sm:text-base">NISN: {student.nisn}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-sm sm:text-base">{student.email}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm sm:text-base">{student.class_name || "Belum ada kelas"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('personal')}
                className={`inline-flex p-4 rounded-t-lg ${activeTab === 'personal'
                  ? 'text-emerald-800 border-b-2 border-emerald-800'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Data Pribadi
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('academic')}
                className={`inline-flex p-4 rounded-t-lg ${activeTab === 'academic'
                  ? 'text-emerald-800 border-b-2 border-emerald-800'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                Data Akademik
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('family')}
                className={`inline-flex p-4 rounded-t-lg ${activeTab === 'family'
                  ? 'text-emerald-800 border-b-2 border-emerald-800'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Data Keluarga
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                }
                label="Jenis Kelamin"
                value={student.gender}
              />
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                }
                label="Tempat, Tanggal Lahir"
                value={student.birth_place_date}
              />
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                }
                label="No. HP"
                value={student.phone_number}
              />
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                }
                label="Alamat"
                value={student.address}
              />
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                }
                label="Ekskul"
                value={student.ekskul}
              />
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                }
                label="Status"
                value={student.graduation_status}
              />
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                }
                label="Tahun Akademik"
                value={student.academic_year}
              />
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                }
                label="Tingkat Akademik"
                value={student.academic_level}
              />
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                }
                label="Program"
                value={student.program}
              />
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                }
                label="Kelas"
                value={student.class_name}
              />
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                }
                label="Halaqah"
                value={student.halaqah}
              />
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                }
                label="Level"
                value={student.level}
              />
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H7a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                }
                label="VA SPP"
                value={student.VA_SPP}
              />
            </div>
          )}

          {activeTab === 'family' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                }
                label="Nama Ayah"
                value={student.father_name}
              />
              <InfoCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                }
                label="Nama Ibu"
                value={student.mother_name}
              />
            </div>
          )}
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

      {/* Modal Konfirmasi Hapus */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        studentName={student.name}
      />
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className="bg-emerald-50 p-2 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-base text-gray-800 font-semibold mt-1">{value || "-"}</p>
        </div>
      </div>
    </div>
  );
}
