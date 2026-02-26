"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTeacherFullById } from "../action";
import Image from "next/image";

import { Eye, Download, ChevronLeft, UserCircle, Briefcase, FileText, Clock, FileCheck } from "lucide-react";

export default function TeacherDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getTeacherFullById(String(params?.id || ""));
      setData(d);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-t-4 border-blue-800">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-blue-800">Detail SDM</h1>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Data terverifikasi: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-3 sm:px-4 py-2 rounded-xl bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm sm:text-base transition-colors"
            >
              {loading ? "Memuat..." : "Refresh Data"}
            </button>
            <button
              onClick={() => router.push("/hrd/teachers")}
              className="px-3 sm:px-4 py-2 rounded-xl bg-blue-800 text-white text-sm sm:text-base hover:bg-blue-900 transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>

        {!data && <div className="mt-6 text-blue-800 text-sm sm:text-base">Memuat...</div>}

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="grid grid-cols-1 gap-3">
              <Field label="NIP" value={data.nip} />
              <Field label="Nama" value={data.user_name} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Titel Awal" value={data.title_prefix} />
                <Field label="Titel Akhir" value={data.title_suffix} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="NIK" value={data.nik} />
                <Field label="NPWP" value={data.npwp} />
              </div>
              <Field label="Email" value={data.email} />
              <Field label="Role" value={data.role} />
              <Field label="Alamat" value={data.address} multiline />
              <Field label="Kota/Kabupaten" value={data.city} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Tanggal Lahir" value={data.birth_date} />
                <Field label="No. HP" value={data.phone_number} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Jenis Kelamin" value={data.gender} />
                <Field label="Pendidikan Terakhir" value={data.education} />
              </div>
              <Field label="Mulai Bekerja" value={data.start_work_date} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Status Ustadz" value={data.status_teacher} />
                <Field label="Status Keaktifan" value={data.active_status} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Jabatan" value={data.position} />
                <Field label="Grade Jabatan" value={data.grade} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Departemen" value={data.department} />
                <Field label="Atasan" value={data.supervisor_name || "Tidak Ada"} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Bank Rekening" value={data.bank_name} />
                <Field label="No Rekening" value={data.bank_account_number} />
              </div>
              <Field label="Nama Akun Rekening" value={data.bank_account_name} />
              <Field label="Tanggal Pensiun" value={data.retirement_date} />

              <Field label="Tipe Jam Kerja" value={data.work_type} />
              <Field label="Shift Kerja" value={data.shift_name} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Kantor Cabang" value={data.branch_office} />
                <Field label="Kantor Utama" value={data.head_office} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Periode Penggajian" value={data.payroll_period} />
                <Field label="Tipe Penggajian" value={data.payroll_type} />
              </div>
              <Field label="Aktivasi Akun" value={data.account_activation} />
              <Field label="Catatan" value={data.notes} multiline />

              <div className="space-y-4 pt-4 border-t border-blue-100">
                <FileView label="Foto Karyawan" base64={data.photo_base64} type="image" />
                <FileView label="Berkas KK" base64={data.kk_file_base64} type="file" />
                <FileView label="Berkas Identitas" base64={data.identity_file_base64} type="file" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FileView({ label, base64, type }: { label: string; base64?: string; type: "image" | "file" }) {
  if (!base64) return <Field label={label} value="Tidak ada file" />;
  
  const isPdf = base64.startsWith("data:application/pdf") || base64.startsWith("JVBERi0"); // Simple check
  const mimeType = isPdf ? "application/pdf" : "image/jpeg"; // Default fallback
  const finalSrc = base64.startsWith("data:") ? base64 : `data:${mimeType};base64,${base64}`;

  return (
    <div>
      <label className="text-sm text-blue-800 font-medium mb-1 block">{label}</label>
      <div className="border-2 border-blue-300 rounded-xl p-3 bg-gray-50">
        {type === "image" ? (
          <div className="flex flex-col gap-2">
             <div className="relative w-32 h-32">
               <Image 
                 src={finalSrc} 
                 alt={label} 
                 fill
                 sizes="128px"
                 className="object-cover rounded-lg border border-gray-200" 
               />
             </div>
             <a href={finalSrc} download={`${label}.jpg`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
               <Download className="w-4 h-4" /> Download
             </a>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
               <Eye className="w-5 h-5" />
            </div>
            <a href={finalSrc} download={isPdf ? `${label}.pdf` : `${label}.jpg`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
               <Download className="w-4 h-4" /> Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, multiline }: { label: string; value: any; multiline?: boolean }) {
  return (
    <div>
      <label className="text-sm text-blue-800">{label}</label>
      {multiline ? (
        <div className="border-2 border-blue-300 rounded-xl px-3 py-3 min-h-24 bg-gray-50 text-blue-900">{value || '-'}</div>
      ) : (
        <div className="border-2 border-blue-300 rounded-xl px-3 py-2 bg-gray-50 text-blue-900">{value || '-'}</div>
      )}
    </div>
  );
}
