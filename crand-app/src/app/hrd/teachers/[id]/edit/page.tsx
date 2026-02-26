"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTeacherFullById, updateTeacherFull, getManagerOptions, getPayrollTypesOptions } from "../../action";
import { toast } from "sonner";
import { ROLES } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";

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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const debouncedForm = useDebounce(form, 1500);
  const isFirstRender = useRef(true);

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
      // Set isFirstRender to false after initial data load
      setTimeout(() => { isFirstRender.current = false; }, 500);
    })();
  }, [params?.id]);

  // Auto-save effect
  useEffect(() => {
    if (isFirstRender.current || !debouncedForm) return;

    const save = async () => {
      setIsAutoSaving(true);
      try {
        await updateTeacherFull(String(params?.id || ""), { ...debouncedForm, user_id: debouncedForm.user_id });
        setLastSaved(new Date());
      } catch (e) {
        console.error("Auto-save failed", e);
        toast.error("Gagal menyimpan otomatis");
      } finally {
        setIsAutoSaving(false);
      }
    };

    save();
  }, [debouncedForm, params?.id]);

  const readFileAsBase64 = (f: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, key: "photo_base64" | "kk_file_base64" | "identity_file_base64", allowed: string[]) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowed.includes(ext)) {
      toast.error("Format file tidak valid");
      return;
    }
    const base64 = await readFileAsBase64(file);
    setForm((prev: any) => ({ ...prev, [key]: base64 }));
  };

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-6">
        <div className="max-w-6xl mx-auto mt-10 bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-800">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto mt-6 sm:mt-10">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-blue-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">Edit Data SDM</h1>
            <p className="text-blue-600 text-sm mt-1">Perbarui informasi data SDM</p>
            {isAutoSaving && <p className="text-xs text-amber-600 font-semibold animate-pulse">Menyimpan perubahan...</p>}
            {!isAutoSaving && lastSaved && <p className="text-xs text-green-600">Tersimpan otomatis pada {lastSaved.toLocaleTimeString()}</p>}
          </div>
          <button 
            onClick={() => router.push(`/hrd/teachers/${params?.id}`)} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-blue-800 font-medium hover:bg-gray-200 transition-all w-full sm:w-auto justify-center"
          >
            Kembali
          </button>
        </div>

        <div className="space-y-6">
          {/* Card: Identitas Utama */}
          <Card title="Identitas Utama">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <LabeledInput label="NIP" value={form.nip} onChange={(v) => setForm({ ...form, nip: v })} required />
                <LabeledInput label="Nama Lengkap" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <div className="grid grid-cols-2 gap-4">
                  <LabeledInput label="Titel Awal" value={form.title_prefix} onChange={(v) => setForm({ ...form, title_prefix: v })} />
                  <LabeledInput label="Titel Akhir" value={form.title_suffix} onChange={(v) => setForm({ ...form, title_suffix: v })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <LabeledInput label="NIK" value={form.nik} onChange={(v) => setForm({ ...form, nik: v })} />
                  <LabeledInput label="NPWP" value={form.npwp} onChange={(v) => setForm({ ...form, npwp: v })} />
                </div>
                <LabeledInput type="email" label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                <LabeledSelect label="Role Sistem" value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={[...ROLES]} required />
                <div className="md:col-span-2">
                  <LabeledTextarea label="Alamat Domisili" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
                </div>
                <LabeledInput label="Kota/Kabupaten" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <div className="grid grid-cols-2 gap-4">
                  <LabeledInput type="date" label="Tanggal Lahir" value={form.birth_date} onChange={(v) => setForm({ ...form, birth_date: v })} />
                  <LabeledInput label="No. HP" value={form.phone_number} onChange={(v) => setForm({ ...form, phone_number: v })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <LabeledSelect label="Jenis Kelamin" value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} options={["Laki-laki","Perempuan"]} />
                  <LabeledSelect label="Pendidikan Terakhir" value={form.education} onChange={(v) => setForm({ ...form, education: v })} options={educations} />
                </div>
             </div>
          </Card>

          {/* Card: Kepegawaian */}
          <Card title="Kepegawaian & Jabatan">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <LabeledInput type="date" label="Mulai Bekerja" value={form.start_work_date} onChange={(v) => setForm({ ...form, start_work_date: v })} />
              <div className="grid grid-cols-2 gap-4">
                <LabeledSelect label="Status SDM" value={form.status_teacher} onChange={(v) => setForm({ ...form, status_teacher: v })} options={["SDM","Pengabdian","Kontrak"]} />
                <LabeledSelect label="Status Keaktifan" value={form.active_status} onChange={(v) => setForm({ ...form, active_status: v })} options={["Aktif","Non Aktif"]} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <LabeledSelect label="Jabatan" value={form.position} onChange={(v) => setForm({ ...form, position: v })} options={positions} required />
                <LabeledSelect label="Grade" value={form.grade} onChange={(v) => setForm({ ...form, grade: v })} options={["A","B","C","D","E"]} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <LabeledSelect label="Departemen" value={form.department} onChange={(v) => setForm({ ...form, department: v })} options={departments} required />
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Atasan</label>
                  <select className="w-full border border-gray-300 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" value={form.supervisor_user_id || ''} onChange={(e) => setForm({ ...form, supervisor_user_id: e.target.value })}>
                    <option value="">Pilih...</option>
                    <option value="none">Tidak Ada</option>
                    {managers.map((m) => (
                      <option key={m.user_id} value={m.user_id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <LabeledSelect label="Kantor Cabang" value={form.branch_office} onChange={(v) => setForm({ ...form, branch_office: v })} options={branches} required />
                <LabeledSelect label="Kantor Utama" value={form.head_office} onChange={(v) => setForm({ ...form, head_office: v })} options={["Belum Dipilih","Pesantren Ibnu Syam 2"]} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">Tanggal Pensiun</label>
                <input type="date" className="w-full border border-gray-300 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" value={form.retirement_date || ''} onChange={(e) => setForm({ ...form, retirement_date: e.target.value })} />
              </div>
            </div>
          </Card>

          {/* Card: Keuangan & Jadwal */}
          <Card title="Keuangan & Jadwal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="grid grid-cols-2 gap-4">
                  <LabeledSelect label="Bank" value={form.bank_name} onChange={(v) => setForm({ ...form, bank_name: v })} options={banks} />
                  <LabeledInput label="No Rekening" value={form.bank_account_number} onChange={(v) => setForm({ ...form, bank_account_number: v })} />
               </div>
               <LabeledInput label="Nama Pemilik Rekening" value={form.bank_account_name} onChange={(v) => setForm({ ...form, bank_account_name: v })} />
               <div className="grid grid-cols-2 gap-4">
                 <LabeledSelect label="Tipe Jam Kerja" value={form.work_type} onChange={(v) => setForm({ ...form, work_type: v })} options={["Reguler","Shift"]} />
                 <LabeledSelect label="Shift Kerja" value={form.shift_name} onChange={(v) => setForm({ ...form, shift_name: v })} options={["Reguler","Custom","Shift 1","Shift 2","Shift 3"]} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <LabeledSelect label="Periode Gaji" value={form.payroll_period} onChange={(v) => setForm({ ...form, payroll_period: v })} options={["Jam","Mingguan","Bulanan"]} />
                 <LabeledSelect label="Tipe Gaji" value={form.payroll_type} onChange={(v) => setForm({ ...form, payroll_type: v })} options={payrollTypesOpts} />
               </div>
            </div>
          </Card>

           {/* Card: Berkas & Lainnya */}
           <Card title="Berkas & Lainnya">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FileInput label="Foto Karyawan (.jpg/.png)" onChange={(e) => handleFile(e, "photo_base64", ["jpg","jpeg","png"]) } hasFile={!!form.photo_base64} />
                <FileInput label="Berkas KK (.jpg/.pdf)" onChange={(e) => handleFile(e, "kk_file_base64", ["jpg","jpeg","png","pdf"]) } hasFile={!!form.kk_file_base64} />
                <FileInput label="Berkas Identitas (.jpg/.pdf)" onChange={(e) => handleFile(e, "identity_file_base64", ["jpg","jpeg","png","pdf"]) } hasFile={!!form.identity_file_base64} />
                <div className="grid grid-cols-2 gap-4">
                  <LabeledSelect label="Aktivasi Akun" value={form.account_activation} onChange={(v) => setForm({ ...form, account_activation: v })} options={["Ya","Tidak"]} />
                </div>
                <div className="md:col-span-2">
                  <LabeledTextarea label="Catatan Tambahan" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} rows={4} />
                </div>
             </div>
           </Card>

           <div className="flex justify-end pt-4 pb-10">
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-blue-800 text-white font-bold rounded-xl shadow-lg hover:bg-blue-900 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>Simpan Perubahan</>
                )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = "text", required }: { label: string; value: any; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-600 mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type={type} 
        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-800 placeholder:text-gray-400" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}

function LabeledSelect({ label, value, onChange, options, required }: { label: string; value: any; onChange: (v: string) => void; options: string[]; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-600 mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select 
        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-800" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Pilih...</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function LabeledTextarea({ label, value, onChange, rows = 3 }: { label: string; value: any; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-600 mb-1 block">{label}</label>
      <textarea 
        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-800 resize-none" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        rows={rows}
      />
    </div>
  );
}

function FileInput({ label, onChange, hasFile }: { label: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; hasFile: boolean }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-600 mb-1 block">{label}</label>
      <div className={`border-2 border-dashed rounded-xl px-4 py-4 transition-colors ${hasFile ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
        <input className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" type="file" onChange={onChange} />
        {hasFile && <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">✓ File terpilih/tersedia</p>}
      </div>
    </div>
  );
}