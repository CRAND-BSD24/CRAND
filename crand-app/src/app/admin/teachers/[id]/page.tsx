'use client';

import { useState, useEffect, use } from "react";
import { getTeacherById } from "./action";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Teacher {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone_number: string;
    profile_picture?: string;
    created_at: string;
    updated_at: string;
  };
  nip: string;
  address: string;
  created_at: string;
  updated_at: string;
}

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
    <div className="container mx-auto p-6">
      <div className="max-w-5xl mx-auto bg-background rounded-lg border shadow-sm">
        {/* Header Section */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/teachers">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(true)}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => alert("Handler hapus belum dibuat")}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-32 w-32">
              <Image
                src={teacher.user_id.profile_picture || '/default-avatar.png'}
                alt={teacher.user_id.name}
                fill
                className="rounded-full border-4 border-primary/10 object-cover"
              />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">{teacher.user_id.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary">NIP: {teacher.nip}</Badge>
                <Badge variant="outline">{teacher.user_id.email}</Badge>
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
                <InfoItem label="No. HP" value={teacher.user_id.phone_number} />
                <InfoItem label="Alamat" value={teacher.address} />
                <InfoItem 
                  label="Tanggal Bergabung" 
                  value={new Date(teacher.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })} 
                />
                <InfoItem 
                  label="Terakhir Diperbarui" 
                  value={new Date(teacher.updated_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} 
                />
              </InfoSection>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal will be added here */}
    </div>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 flex flex-col space-y-1.5">
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="p-6 pt-0 space-y-4">
        {children}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
} 