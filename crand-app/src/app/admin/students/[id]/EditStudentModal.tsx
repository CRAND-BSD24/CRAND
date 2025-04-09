"use client";

import { Student } from "@/types/student";
import { useState, useEffect } from "react";
import { updateStudentById } from "./action";
import { useToast } from "@/components/ui/use-toast";

interface FormData {
  name: string;
  nisn: string;
  email: string;
  gender: string;
  phone_number: string;
  father_name: string;
  academic_year: string;
  program: string;
  ekskul: string;
  class_id: string;
  VA_SPP: string;
  birth_place_date: string;
  address: string;
  mother_name: string;
  academic_level: string;
  level: string;
  halaqah_id: string;
  graduation_status: string;
  profile_picture: string;
}

interface Class {
  _id: string;
  class_name: string;
}

interface Halaqah {
  _id: string;
  name: string;
}

interface EditStudentModalProps {
  student: Student;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditStudentModal({ student, onClose, onUpdated }: EditStudentModalProps) {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [halaqahs, setHalaqahs] = useState<Halaqah[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: student.name || "",
    nisn: student.nisn || "",
    email: student.email || "",
    gender: student.gender || "",
    phone_number: student.phone_number || "",
    father_name: student.father_name || "",
    academic_year: student.academic_year || "",
    program: student.program || "",
    ekskul: student.ekskul || "",
    class_id: student.class_id || "",
    VA_SPP: student.VA_SPP || "",
    birth_place_date: student.birth_place_date || "",
    address: student.address || "",
    mother_name: student.mother_name || "",
    academic_level: student.academic_level || "",
    level: student.level || "",
    halaqah_id: student.halaqah_id || "",
    graduation_status: student.graduation_status || "",
    profile_picture: student.profile_picture || "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [classesRes, halaqahsRes] = await Promise.all([
          fetch('/api/classes', { cache: 'no-store' }),
          fetch('/api/halaqahs', { cache: 'no-store' })
        ]);

        if (!classesRes.ok || !halaqahsRes.ok) {
          throw new Error('Failed to fetch class or halaqah data');
        }

        const classesData = await classesRes.json();
        const halaqahsData = await halaqahsRes.json();

        if (!Array.isArray(classesData) || !Array.isArray(halaqahsData)) {
          throw new Error('Invalid data format');
        }

        setClasses(classesData);
        setHalaqahs(halaqahsData.map((h: { _id: string; name: string }) => ({ _id: h._id, name: h.name })));
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Gagal memuat data dropdown.";
        console.error('Error fetching dropdown data:', error);
        toast({ variant: "destructive", title: "Error", description: msg });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        nisn: student.nisn || "",
        email: student.email || "",
        gender: student.gender || "",
        phone_number: student.phone_number || "",
        father_name: student.father_name || "",
        academic_year: student.academic_year || "",
        program: student.program || "",
        ekskul: student.ekskul || "",
        class_id: student.class_id || "",
        VA_SPP: student.VA_SPP || "",
        birth_place_date: student.birth_place_date || "",
        address: student.address || "",
        mother_name: student.mother_name || "",
        academic_level: student.academic_level || "",
        level: student.level || "",
        halaqah_id: student.halaqah_id || "",
        graduation_status: student.graduation_status || "",
        profile_picture: student.profile_picture || "",
      });
    }
  }, [student]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatedData = {
      ...formData,
      class_id: formData.class_id || null,
      halaqah_id: formData.halaqah_id || null,
      payment_status: student.payment_status,
    };

    try {
      const success = await updateStudentById(student._id, updatedData);
      if (success) {
        toast({ title: "Success", description: "Data santri berhasil diperbarui" });
        onUpdated();
        onClose();
      } else {
        toast({ variant: "destructive", title: "Error", description: "Gagal memperbarui data santri" });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
      console.error("Error updating student:", error);
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-emerald-200">
        <h2 className="text-2xl font-bold text-emerald-800 mb-4">Edit Data Santri</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">NISN</label>
            <input
              type="text"
              name="nisn"
              value={formData.nisn}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Jenis Kelamin</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            >
              <option value="" disabled>Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Tempat, Tanggal Lahir</label>
            <input
              type="text"
              name="birth_place_date"
              value={formData.birth_place_date}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">No HP</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number || ''}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="block text-sm font-medium text-emerald-700">Alamat</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Nama Ayah</label>
            <input
              type="text"
              name="father_name"
              value={formData.father_name}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Nama Ibu</label>
            <input
              type="text"
              name="mother_name"
              value={formData.mother_name}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Tahun Akademik</label>
            <input
              type="text"
              name="academic_year"
              value={formData.academic_year}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Tingkat Akademik</label>
            <select
              name="academic_level"
              value={formData.academic_level}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            >
              <option value="" disabled>Pilih Tingkat Akademik</option>
              <option value="Ula">Ula</option>
              <option value="Wustho">Wustho</option>
              <option value="Ulya">Ulya</option>
              <option value="SMP Formal">SMP Formal</option>
              <option value="Aliyah Agama">Aliyah Agama</option>
              <option value="Aliyah IPA">Aliyah IPA</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Program</label>
            <select
              name="program"
              value={formData.program}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            >
              <option value="" disabled>Pilih Program</option>
              <option value="Reguler">Reguler</option>
              <option value="Shorhul Qurro">Shorhul Qurro</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Kelas</label>
            <select
              name="class_id"
              value={formData.class_id || ''}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            >
              <option value="" disabled>Pilih Kelas</option>
              {classes.length > 0 ? (
                classes.map((kelas) => (
                  <option key={kelas._id} value={kelas._id}>
                    {kelas.class_name}
                  </option>
                ))
              ) : (
                <option disabled>{loading ? 'Loading...' : 'Tidak ada kelas'}</option>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Halaqah</label>
            <select
              name="halaqah_id"
              value={formData.halaqah_id || ''}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            >
              <option value="" disabled>Pilih Halaqah</option>
              {halaqahs.length > 0 ? (
                halaqahs.map((halaqah) => (
                  <option key={halaqah._id} value={halaqah._id}>
                    {halaqah.name}
                  </option>
                ))
              ) : (
                <option disabled>{loading ? 'Loading...' : 'Tidak ada halaqah'}</option>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            >
              <option value="" disabled>Pilih Level</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">VA SPP</label>
            <input
              type="text"
              name="VA_SPP"
              value={formData.VA_SPP || ''}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Ekskul</label>
            <select
              name="ekskul"
              value={formData.ekskul}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            >
              <option value="" disabled>Pilih Ekskul</option>
              <option value="Memanah">Memanah</option>
              <option value="Berkuda">Berkuda</option>
              <option value="Renang">Renang</option>
              <option value="Media">Media</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Status Santri</label>
            <select
              name="graduation_status"
              value={formData.graduation_status}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              required
            >
              <option value="" disabled>Pilih Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
              <option value="Lulus">Lulus</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-700">Foto Profil (URL)</label>
            <input
              type="text"
              name="profile_picture"
              value={formData.profile_picture}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="col-span-2 flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-800 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}