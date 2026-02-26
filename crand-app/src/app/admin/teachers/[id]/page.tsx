'use client';

import { useState, useEffect, use } from "react";
import { getTeacherById, Teacher } from "@/lib/api/teacher";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import EditTeacherModal from "./EditTeacherModal";
import DeleteButton from "./DeleteButton";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function TeacherDetailPage({ params }: Props) {
  const { id } = use(params);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchTeacher = async () => {
      const data = await getTeacherById(id);
      if (!data) return notFound();
      setTeacher(data);
    };
    fetchTeacher();
  }, [id]);

  if (!teacher) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading data guru...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="max-w-5xl mx-auto bg-white rounded-xl border-t-4 border-blue-800 shadow-xl transition-all duration-300 hover:shadow-blue-200/50">
        {/* Header Section */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/teachers">
              <Button variant="ghost" size="sm" className="gap-2 text-blue-800 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(true)}
                className="gap-2 border-blue-800 text-blue-800 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <DeleteButton teacherId={teacher._id} teacherName={teacher.user_id.name} />
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-32 w-32 group">
              <div className="absolute -inset-0.5 bg-blue-800 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-full w-full rounded-full overflow-hidden border-4 border-white">
                <Image
                  src={teacher.user_id.profile_picture || '/default-avatar.png'}
                  alt={teacher.user_id.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-blue-800 text-white p-1 rounded-full shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-blue-800">{teacher.user_id.name}</h2>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">NIP: {teacher.nip}</Badge>
                <Badge variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-50 transition-colors">{teacher.user_id.email}</Badge>
              </div>
            </div>
          </div>
          <Separator />
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 gap-6">
              <InfoSection title="Informasi Pribadi">
                <InfoItem label="Nama Lengkap" value={teacher.user_id.name} />
                <InfoItem label="NIP" value={teacher.nip} />
                <InfoItem label="Email" value={teacher.user_id.email} />
                <InfoItem label="No. HP" value={teacher.phone} />
                <InfoItem label="Mata Pelajaran" value={teacher.subject} />
                <InfoItem 
                  label="ID Guru" 
                  value={teacher._id} 
                />
              </InfoSection>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditTeacherModal
          teacher={teacher}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            // Refresh data
            const fetchTeacher = async () => {
              const data = await getTeacherById(id);
              if (!data) return notFound();
              setTeacher(data);
            };
            fetchTeacher();
          }}
        />
      )}
    </div>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-white text-card-foreground shadow-md hover:shadow-lg transition-all duration-300">
      <div className="p-6 flex flex-col space-y-1.5 border-b border-blue-100">
        <h3 className="font-semibold text-lg text-blue-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {title}
        </h3>
      </div>
      <div className="p-6 pt-4 space-y-4 bg-gradient-to-br from-white to-blue-50/30 rounded-b-xl">
        {children}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="p-3 space-y-1 rounded-lg hover:bg-blue-50/50 transition-colors duration-200 group border border-transparent hover:border-blue-100">
      <p className="text-sm text-blue-600 font-medium">{label}</p>
      <p className="font-medium text-gray-800 group-hover:text-blue-800 transition-colors">{value || "-"}</p>
    </div>
  );
} 