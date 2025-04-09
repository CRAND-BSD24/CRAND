"use client";

import { useEffect, useState } from "react";
import { createNewStudent } from "./action";
import { useToast } from "@/components/ui/use-toast";

interface Class {
  _id: string;
  class_name: string;
}

interface Halaqah {
  _id: string;
  name: string;
}

interface NewStudentFormData {
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
}

export default function AddStudentModal({
  onStudentAdded,
}: {
  onStudentAdded: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [halaqahs, setHalaqahs] = useState<Halaqah[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState<NewStudentFormData>({
    name: "",
    nisn: "",
    email: "",
    gender: "",
    phone_number: "",
    father_name: "",
    academic_year: "",
    program: "",
    ekskul: "",
    class_id: "",
    VA_SPP: "",
    birth_place_date: "",
    address: "",
    mother_name: "",
    academic_level: "",
    level: "",
    halaqah_id: "",
    graduation_status: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, halaqahsRes] = await Promise.all([
          fetch('/api/classes', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          }),
          fetch('/api/halaqahs', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          })
        ]);
        
        if (!classesRes.ok) {
          throw new Error(`Failed to fetch classes: ${classesRes.statusText}`);
        }
        
        if (!halaqahsRes.ok) {
          throw new Error(`Failed to fetch halaqahs: ${halaqahsRes.statusText}`);
        }
        
        const classesData = await classesRes.json();
        const halaqahsData = await halaqahsRes.json();
        
        if (!Array.isArray(classesData)) {
          throw new Error('Invalid classes data format');
        }
        
        if (!Array.isArray(halaqahsData)) {
          throw new Error('Invalid halaqahs data format');
        }
        
        const formattedHalaqahs = halaqahsData.map((halaqah: { _id: string; name: string }) => ({
          _id: halaqah._id,
          name: halaqah.name
        }));
        
        setClasses(classesData);
        setHalaqahs(formattedHalaqahs);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Gagal memuat data kelas dan halaqah";
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = {
        ...form,
        level: form.level
      };
      
      await createNewStudent(formData);
      toast({
        title: "Success",
        description: "Data santri berhasil ditambahkan",
      });
      setIsOpen(false);
      setForm({
        name: "",
        nisn: "",
        email: "",
        gender: "",
        phone_number: "",
        father_name: "",
        academic_year: "",
        program: "",
        ekskul: "",
        class_id: "",
        VA_SPP: "",
        birth_place_date: "",
        address: "",
        mother_name: "",
        academic_level: "",
        level: "",
        halaqah_id: "",
        graduation_status: "",
      });
      onStudentAdded();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menambahkan data santri";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#006A71] text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:bg-[#04858c] transition-all duration-300 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Tambah Santri
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#006A71]">Tambah Data Santri</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">NIS</label>
                <input
                  type="text"
                  name="nisn"
                  value={form.nisn}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
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
                  value={form.birth_place_date}
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
                  value={form.email}
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
                  value={form.phone_number}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                <textarea
                  name="address"
                  value={form.address}
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
                  value={form.father_name}
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
                  value={form.mother_name}
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
                  value={form.academic_year}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tingkat Akademik</label>
                <select
                  name="academic_level"
                  value={form.academic_level}
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
                  value={form.program}
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
                  value={form.class_id}
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
                  value={form.halaqah_id}
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
                  value={form.level}
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
                  value={form.VA_SPP}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A71] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Ekskul</label>
                <select
                  name="ekskul"
                  value={form.ekskul}
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
                  value={form.graduation_status}
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

              <div className="col-span-2 flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
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
                    'Simpan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}