"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTeacherFullById, updateTeacherFull, getManagerOptions, getPayrollTypesOptions } from "../../action";
import { toast } from "sonner";

const positions = [
  "Pimpinan","Penasihat","Direktur Operasional","Direktur Pendidikan","Manajer Kepengasuhan","Manajer Tahfizh","Manajer Keuangan & Bisnis","Manajer Sekolah Menengah & Litbang","Manajer Sekolah Dasar","Manajer Sekretariat","Manajer Aset, Kerumahtanggaan & Infrastruktur","SPV Kedisiplinan, Kerapihan & Kesehatan","SPV Akhlak & Ibadah","SPV Tahfizh","SPV Kurikulum & Kedisiplinan","SPV Bahasa & Pengajaran","SPV BASAM","SPV CRM","SPV Media","SPV Keuangan","SPV PISMART","SPV Laundry","SPV Aset & Infrastruktur","SPV Kerumahtanggaan","Staff Tahfizh","Staff Kepengasuhan","Staff Bahasa & Pengajaran","Security","Office Boy","Staff HRD","Staff Dapur","Staff PISMART","Staff Keuangan"
];
const departments = [
  "Departemen Kepengasuhan","Departemen Tahfizh","Departemen Keuangan & Bisnis","Departemen Sekolah Menengah & Litbang","Departemen Sekolah Dasar","Departemen Sekretariat","Departemen Aset, Kerumahtanggaan & Infrastruktur"
];
const branches = [
  "Pesantren Ibnu Syam 1","Pesantren Ibnu Syam 2 Putra","Pesantren Ibnu Syam 2 Putri","Pesantren Ibnu Syam 5"
];
const banks = [
  "Bank Syariah Indonesia","Bank Central Asia","Bank Mandiri","Bank Rakyat Indonesia","Bank Negara Indonesia","Bank Tabungan Negara","Bank Muamalat"
];
const educations = ["SD","SMP","SMA","D1","D2","D3","S1","S2","S3","Paket C"];

export default function TeacherEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<{ user_id: string; name: string }[]>([]);
  const [payrollTypesOpts, setPayrollTypesOpts] = useState<string[]>([]);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const m = await getManagerOptions();
      setManagers(m);
      const pts = await getPayrollTypesOptions();
      setPayrollTypesOpts(pts);
      const d = await getTeacherFullById(String(params?.id || ""));
      setForm({
        ...d,
        name: d?.user_name || "",
      });
    })();
  }, [params?.id]);

  const handleSubmit = async () => {
    if (!form.nip || !form.name || !form.email || !form.active_status || !form.position || !form.department || !form.branch_office) {
      toast.error("Harap isi semua field wajib");
      return;
    }
    setLoading(true);
    try {
      const res = await updateTeacherFull(String(params?.id || ""), { ...form, user_id: form.user_id });
      if (res.success) {
        toast.success("Perubahan disimpan");
        router.push(`/hrd/teachers/${params?.id}`);
      } else {
        toast.error("Gagal menyimpan perubahan");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan saat menyimpan");
    } finally {
      setLoading(false);
    }
  };

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
        <div className="max-w-6xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-6 border-t-4 border-emerald-800">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto mt-13">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border-t-4 border-emerald-800">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800">Edit Ustadz</h1>
            <button onClick={() => router.push(`/hrd/teachers/${params?.id}`)} className="px-4 py-2 rounded-xl bg-emerald-800 text-white">Kembali</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="grid grid-cols-1 gap-3">
              <LabeledInput label="NIP*" value={form.nip} onChange={(v) => setForm({ ...form, nip: v })} />
              <LabeledInput label="Nama*" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <div className="grid grid-cols-2 gap-2">
                <LabeledInput label="Titel Awal" value={form.title_prefix} onChange={(v) => setForm({ ...form, title_prefix: v })} />
                <LabeledInput label="Titel Akhir" value={form.title_suffix} onChange={(v) => setForm({ ...form, title_suffix: v })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <LabeledInput label="NIK" value={form.nik} onChange={(v) => setForm({ ...form, nik: v })} />
                <LabeledInput label="NPWP" value={form.npwp} onChange={(v) => setForm({ ...form, npwp: v })} />
              </div>
              <LabeledInput type="email" label="Email*" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <LabeledTextarea label="Alamat" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
              <LabeledInput label="Kota/Kabupaten" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
              <div className="grid grid-cols-2 gap-2">
                <LabeledInput type="date" label="Tanggal Lahir" value={form.birth_date} onChange={(v) => setForm({ ...form, birth_date: v })} />
                <LabeledInput label="No. HP" value={form.phone_number} onChange={(v) => setForm({ ...form, phone_number: v })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <LabeledSelect label="Jenis Kelamin" value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} options={["Laki-laki","Perempuan"]} />
                <LabeledSelect label="Pendidikan Terakhir" value={form.education} onChange={(v) => setForm({ ...form, education: v })} options={educations} />
              </div>
              <LabeledInput type="date" label="Mulai Bekerja" value={form.start_work_date} onChange={(v) => setForm({ ...form, start_work_date: v })} />
              <div className="grid grid-cols-2 gap-2">
                <LabeledSelect label="Status Ustadz" value={form.status_teacher} onChange={(v) => setForm({ ...form, status_teacher: v })} options={["SDM","Pengabdian","Kontrak"]} />
                <LabeledSelect label="Status Keaktifan*" value={form.active_status} onChange={(v) => setForm({ ...form, active_status: v })} options={["Aktif","Non Aktif"]} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <LabeledSelect label="Jabatan*" value={form.position} onChange={(v) => setForm({ ...form, position: v })} options={positions} />
                <LabeledSelect label="Grade Jabatan" value={form.grade} onChange={(v) => setForm({ ...form, grade: v })} options={["A","B","C","D","E"]} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <LabeledSelect label="Departemen*" value={form.department} onChange={(v) => setForm({ ...form, department: v })} options={departments} />
                <div>
                  <label className="text-sm text-emerald-800">Atasan</label>
                  <select className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2" value={form.supervisor_user_id || ''} onChange={(e) => setForm({ ...form, supervisor_user_id: e.target.value })}>
                    <option value="">Pilih...</option>
                    <option value="none">Tidak Ada</option>
                    {managers.map((m) => (
                      <option key={m.user_id} value={m.user_id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-2 gap-2">
                <LabeledSelect label="Bank Rekening" value={form.bank_name} onChange={(v) => setForm({ ...form, bank_name: v })} options={banks} />
                <LabeledInput label="No Rekening" value={form.bank_account_number} onChange={(v) => setForm({ ...form, bank_account_number: v })} />
              </div>
              <LabeledInput label="Nama Akun Rekening" value={form.bank_account_name} onChange={(v) => setForm({ ...form, bank_account_name: v })} />
              <LabeledInput type="date" label="Tanggal Pensiun" value={form.retirement_date} onChange={(v) => setForm({ ...form, retirement_date: v })} />

              <div className="grid grid-cols-2 gap-2">
                <LabeledSelect label="Tipe Jam Kerja" value={form.work_type} onChange={(v) => setForm({ ...form, work_type: v })} options={["Reguler","Shift"]} />
                <LabeledSelect label="Shift Kerja" value={form.shift_name} onChange={(v) => setForm({ ...form, shift_name: v })} options={["Reguler","Custom","Shift 1","Shift 2","Shift 3"]} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <LabeledSelect label="Kantor Cabang*" value={form.branch_office} onChange={(v) => setForm({ ...form, branch_office: v })} options={branches} />
                <LabeledSelect label="Kantor Utama" value={form.head_office} onChange={(v) => setForm({ ...form, head_office: v })} options={["Belum Dipilih","Pesantren Ibnu Syam 2"]} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <LabeledSelect label="Periode Penggajian" value={form.payroll_period} onChange={(v) => setForm({ ...form, payroll_period: v })} options={["Jam","Mingguan","Bulanan"]} />
                <LabeledSelect label="Tipe Penggajian" value={form.payroll_type} onChange={(v) => setForm({ ...form, payroll_type: v })} options={payrollTypesOpts} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <LabeledSelect label="Aktivasi Akun" value={form.account_activation} onChange={(v) => setForm({ ...form, account_activation: v })} options={["Ya","Tidak"]} />
                <LabeledTextarea label="Catatan" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} rows={6} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button onClick={handleSubmit} disabled={loading} className="px-5 py-2 rounded-xl bg-emerald-800 text-white disabled:opacity-60">{loading ? "Menyimpan..." : "Simpan"}</button>
            <button onClick={() => router.push(`/hrd/teachers/${params?.id}`)} className="px-5 py-2 rounded-xl bg-gray-200 text-emerald-900">Batal</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = "text" }: { label: string; value: any; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-sm text-emerald-800">{label}</label>
      <input type={type} className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2" value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function LabeledSelect({ label, value, onChange, options }: { label: string; value: any; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-sm text-emerald-800">{label}</label>
      <select className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2" value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">Pilih...</option>
        {options.map((o) => (<option key={o}>{o}</option>))}
      </select>
    </div>
  );
}

function LabeledTextarea({ label, value, onChange, rows = 4 }: { label: string; value: any; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="text-sm text-emerald-800">{label}</label>
      <textarea rows={rows} className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2" value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}