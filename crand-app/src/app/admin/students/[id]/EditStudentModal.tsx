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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#006A71]">Edit Data Santri</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 sm:p-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">NISN</label>
            <input
              type="text"
              name="nisn"
              value={formData.nisn}
              onChange={handleChange}
              className="w-full p-2 sm:p-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 sm:p-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              required
            >
              <option value="" disabled>Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tempat, Tanggal Lahir</label>
            <input
              type="text"
              name="birth_place_date"
              value={formData.birth_place_date}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">No HP</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number || ''}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="block text-sm font-medium text-gray-700">Alamat</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nama Ayah</label>
            <input
              type="text"
              name="father_name"
              value={formData.father_name}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nama Ibu</label>
            <input
              type="text"
              name="mother_name"
              value={formData.mother_name}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tahun Akademik</label>
            <input
              type="text"
              name="academic_year"
              value={formData.academic_year}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tingkat Akademik</label>
            <select
              name="academic_level"
              value={formData.academic_level}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
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
            <label className="block text-sm font-medium text-gray-700">Program</label>
            <select
              name="program"
              value={formData.program}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              required
            >
              <option value="" disabled>Pilih Program</option>
              <option value="Reguler">Reguler</option>
              <option value="Shorhul Qurro">Shorhul Qurro</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Kelas</label>
            <select
              name="class_id"
              value={formData.class_id || ''}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
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
            <label className="block text-sm font-medium text-gray-700">Halaqah</label>
            <select
              name="halaqah_id"
              value={formData.halaqah_id || ''}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
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
            <label className="block text-sm font-medium text-gray-700">Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              required
            >
              <option value="" disabled>Pilih Level</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">VA SPP</label>
            <input
              type="text"
              name="VA_SPP"
              value={formData.VA_SPP || ''}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ekskul</label>
            <select
              name="ekskul"
              value={formData.ekskul}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
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
            <label className="block text-sm font-medium text-gray-700">Status Santri</label>
            <select
              name="graduation_status"
              value={formData.graduation_status}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              required
            >
              <option value="" disabled>Pilih Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
              <option value="Lulus">Lulus</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Foto Profil (URL)</label>
            <input
              type="text"
              name="profile_picture"
              value={formData.profile_picture}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="col-span-2 flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#006A71] text-white rounded-lg hover:bg-[#04858c] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}