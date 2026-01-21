"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTeacherFullById } from "../action";

export default function TeacherDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const d = await getTeacherFullById(String(params?.id || ""));
      setData(d);
    })();
  }, [params?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-6 border-t-4 border-emerald-800">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800">Detail Ustadz</h1>
          <button onClick={() => router.push("/hrd/teachers")} className="px-4 py-2 rounded-xl bg-emerald-800 text-white">Kembali</button>
        </div>

        {!data && <div className="mt-6 text-emerald-800">Memuat...</div>}

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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, multiline }: { label: string; value: any; multiline?: boolean }) {
  return (
    <div>
      <label className="text-sm text-emerald-800">{label}</label>
      {multiline ? (
        <div className="border-2 border-emerald-300 rounded-xl px-3 py-3 min-h-24 bg-gray-50 text-emerald-900">{value || '-'}</div>
      ) : (
        <div className="border-2 border-emerald-300 rounded-xl px-3 py-2 bg-gray-50 text-emerald-900">{value || '-'}</div>
      )}
    </div>
  );
}