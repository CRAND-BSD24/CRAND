"use client";

import { useEffect, useState } from "react";
import { createTeacherFull, getManagerOptions, getJobPositionsOptions, getDepartmentsOptions, getBranchOfficesOptions, getPayrollTypesOptions, normalizeTeacherPayrollTypes } from "../action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROLES } from "../../../../lib/constants";

const positions: string[] = [];
const departments: string[] = [];
const branches: string[] = [];

const banks = [
  "Bank Syariah Indonesia",
  "Bank Central Asia",
  "Bank Mandiri",
  "Bank Rakyat Indonesia",
  "Bank Negara Indonesia",
  "Bank Tabungan Negara",
  "Bank Muamalat",
];

const educations = ["SD","SMP","SMA","D1","D2","D3","S1","S2","S3","Paket C"];

export default function CreateTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<{ user_id: string; name: string }[]>([]);
  const [positionsOpts, setPositionsOpts] = useState<string[]>([]);
  const [departmentsOpts, setDepartmentsOpts] = useState<string[]>([]);
  const [branchesOpts, setBranchesOpts] = useState<string[]>([]);
  const [payrollTypesOpts, setPayrollTypesOpts] = useState<string[]>([]);

  const [form, setForm] = useState({
    nip: "",
    name: "",
    title_prefix: "",
    title_suffix: "",
    role: "teacher",
    nik: "",
    npwp: "",
    email: "",
    address: "",
    city: "",
    birth_date: "",
    phone_number: "",
    gender: "",
    education: "",
    start_work_date: "",
    status_teacher: "",
    active_status: "",
    position: "",
    grade: "",
    department: "",
    supervisor_user_id: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
    retirement_date: "",
    photo_base64: "",
    kk_file_base64: "",
    identity_file_base64: "",
    work_type: "",
    shift_name: "",
    branch_office: "",
    head_office: "",
    payroll_period: "",
    payroll_type: "",
    account_activation: "Tidak",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      const list = await getManagerOptions();
      setManagers(list);
      const [pos, deps, brs] = await Promise.all([
        getJobPositionsOptions(),
        getDepartmentsOptions(),
        getBranchOfficesOptions(),
      ]);
      setPositionsOpts(pos);
      setDepartmentsOpts(deps);
      setBranchesOpts(brs);
      const pts = await getPayrollTypesOptions();
      await normalizeTeacherPayrollTypes();
      setPayrollTypesOpts(pts);
    })();
  }, []);

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
    setForm((prev) => ({ ...prev, [key]: base64 }));
  };

  const handleSubmit = async () => {
    if (!form.nip || !form.name || !form.email || !form.active_status || !form.position || !form.department || !form.branch_office) {
      toast.error("Harap isi semua field wajib");
      return;
    }
    setLoading(true);
    try {
      const res = await createTeacherFull(form);
      if (res.success) {
        toast.success("SDM berhasil ditambahkan");
        router.push("/hrd/teachers");
      } else {
        toast.error("Gagal menambahkan SDM");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan saat menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto mt-13">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border-t-4 border-blue-800">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-6">Tambah SDM</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm text-blue-800">NIP*</label>
                <input className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-blue-800">Nama*</label>
                <input className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-blue-800">Titel Awal</label>
                  <input className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.title_prefix} onChange={(e) => setForm({ ...form, title_prefix: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-blue-800">Titel Akhir</label>
                  <input className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.title_suffix} onChange={(e) => setForm({ ...form, title_suffix: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-blue-800">NIK</label>
                  <input className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-blue-800">NPWP</label>
                  <input className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.npwp} onChange={(e) => setForm({ ...form, npwp: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-blue-800">Email*</label>
                  <input type="email" className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-blue-800">Role*</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-blue-800">Alamat</label>
                <textarea className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-blue-800">Kota/Kabupaten</label>
                <input className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-blue-800">Tanggal Lahir</label>
                  <input type="date" className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-blue-800">No. HP</label>
                  <input className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-blue-800">Jenis Kelamin</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Pilih...</option>
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-blue-800">Pendidikan Terakhir</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })}>
                    <option value="">Pilih...</option>
                    {educations.map((e) => <option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-blue-800">Mulai Bekerja</label>
                <input type="date" className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.start_work_date} onChange={(e) => setForm({ ...form, start_work_date: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-blue-800">Status SDM</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.status_teacher} onChange={(e) => setForm({ ...form, status_teacher: e.target.value })}>
                    <option value="">Pilih...</option>
                    <option>SDM</option>
                    <option>Pengabdian</option>
                    <option>Kontrak</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-blue-800">Status Keaktifan*</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.active_status} onChange={(e) => setForm({ ...form, active_status: e.target.value })}>
                    <option value="">Pilih...</option>
                    <option>Aktif</option>
                    <option>Non Aktif</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-blue-800">Jabatan*</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                    <option value="">Pilih...</option>
                    {positionsOpts.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-blue-800">Grade Jabatan</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                    <option value="">Pilih...</option>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                    <option>D</option>
                    <option>E</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-blue-800">Departemen*</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                    <option value="">Pilih...</option>
                    {departmentsOpts.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-blue-800">Atasan</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.supervisor_user_id} onChange={(e) => setForm({ ...form, supervisor_user_id: e.target.value })}>
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
                <div>
                  <label className="text-sm text-blue-800">Bank Rekening</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })}>
                    <option value="">Pilih...</option>
                    {banks.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-blue-800">No Rekening</label>
                  <input className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.bank_account_number} onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm text-blue-800">Nama Akun Rekening</label>
                <input className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.bank_account_name} onChange={(e) => setForm({ ...form, bank_account_name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-blue-800">Tanggal Pensiun</label>
                <input type="date" className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.retirement_date} onChange={(e) => setForm({ ...form, retirement_date: e.target.value })} />
              </div>

              <div>
                <label className="text-sm text-blue-800">Foto Karyawan (.jpg/.png)</label>
                <div className="border-2 border-blue-300 rounded-xl px-3 py-3 bg-white">
                  <input className="w-full" type="file" accept=".jpg,.jpeg,.png" onChange={(e) => handleFile(e, "photo_base64", ["jpg","jpeg","png"]) } />
                </div>
              </div>
              <div>
                <label className="text-sm text-blue-800">Berkas KK (.jpg/.png/.pdf)</label>
                <div className="border-2 border-blue-300 rounded-xl px-3 py-3 bg-white">
                  <input className="w-full" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFile(e, "kk_file_base64", ["jpg","jpeg","png","pdf"]) } />
                </div>
              </div>
              <div>
                <label className="text-sm text-blue-800">Berkas Identitas (.jpg/.png/.pdf)</label>
                <div className="border-2 border-blue-300 rounded-xl px-3 py-3 bg-white">
                  <input className="w-full" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFile(e, "identity_file_base64", ["jpg","jpeg","png","pdf"]) } />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-blue-800">Tipe Jam Kerja</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.work_type} onChange={(e) => setForm({ ...form, work_type: e.target.value })}>
                    <option value="">Pilih...</option>
                    <option>Reguler</option>
                    <option>Shift</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-blue-800">Shift Kerja</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.shift_name} onChange={(e) => setForm({ ...form, shift_name: e.target.value })}>
                    <option value="">Pilih...</option>
                    <option>Reguler</option>
                    <option>Custom</option>
                    <option>Shift 1</option>
                    <option>Shift 2</option>
                    <option>Shift 3</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-blue-800">Kantor Cabang*</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.branch_office} onChange={(e) => setForm({ ...form, branch_office: e.target.value })}>
                    <option value="">Pilih...</option>
                    {branchesOpts.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-blue-800">Kantor Utama</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.head_office} onChange={(e) => setForm({ ...form, head_office: e.target.value })}>
                    <option value="">Pilih...</option>
                    <option>Belum Dipilih</option>
                    <option>Pesantren Ibnu Syam 2</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-blue-800">Periode Penggajian</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.payroll_period} onChange={(e) => setForm({ ...form, payroll_period: e.target.value })}>
                    <option value="">Pilih...</option>
                    <option>Jam</option>
                    <option>Mingguan</option>
                    <option>Bulanan</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-blue-800">Tipe Penggajian</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.payroll_type} onChange={(e) => setForm({ ...form, payroll_type: e.target.value })}>
                    <option value="">Pilih...</option>
                    {payrollTypesOpts.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-blue-800">Aktivasi Akun</label>
                  <select className="w-full border-2 border-blue-300 rounded-xl px-3 py-2" value={form.account_activation} onChange={(e) => setForm({ ...form, account_activation: e.target.value })}>
                    <option value="Tidak">Pilih...</option>
                    <option>Ya</option>
                    <option>Tidak</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-blue-800">Catatan</label>
                  <textarea rows={6} className="w-full border-2 border-blue-300 rounded-xl px-3 py-2 min-h-32" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button onClick={handleSubmit} disabled={loading} className="px-5 py-2 rounded-xl bg-blue-800 text-white disabled:opacity-60">{loading ? "Menyimpan..." : "Simpan"}</button>
            <button onClick={() => router.push("/hrd/teachers")} className="px-5 py-2 rounded-xl bg-gray-200 text-blue-900">Batal</button>
          </div>
        </div>
      </div>
    </div>
  );
}