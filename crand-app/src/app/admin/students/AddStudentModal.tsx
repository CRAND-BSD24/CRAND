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
        className="bg-emerald-800 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Tambah Santri
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl my-4 relative border border-emerald-200">
            <div className="max-h-[85vh] overflow-y-auto px-2 custom-scrollbar">
              <div className="absolute right-4 top-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h2 className="text-xl font-bold text-emerald-900 mb-4">Tambah Data Santri</h2>

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-800" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-semibold text-emerald-900">Data Pribadi</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Nama Lengkap</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">NIS</label>
                      <input
                        type="text"
                        name="nisn"
                        value={form.nisn}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Jenis Kelamin</label>
                      <select
                        name="gender"
                        value={form.gender}
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
                      <label className="block text-sm font-semibold text-gray-700">Tempat, Tanggal Lahir</label>
                      <input
                        type="text"
                        name="birth_place_date"
                        value={form.birth_place_date}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">No HP</label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={form.phone_number}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="block text-sm font-medium">Alamat</label>
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Nama Ayah</label>
                      <input
                        type="text"
                        name="father_name"
                        value={form.father_name}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Nama Ibu</label>
                      <input
                        type="text"
                        name="mother_name"
                        value={form.mother_name}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Tahun Akademik</label>
                      <input
                        type="text"
                        name="academic_year"
                        value={form.academic_year}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Tingkat Akademik</label>
                      <select
                        name="academic_level"
                        value={form.academic_level}
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
                      <label className="block text-sm font-semibold text-gray-700">Program</label>
                      <select
                        name="program"
                        value={form.program}
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
                      <label className="block text-sm font-semibold text-gray-700">Kelas</label>
                      <select
                        name="class_id"
                        value={form.class_id}
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
                          <option disabled>Loading...</option>
                        )}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Halaqah</label>
                      <select
                        name="halaqah_id"
                        value={form.halaqah_id}
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
                          <option disabled>Loading...</option>
                        )}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Level</label>
                      <select
                        name="level"
                        value={form.level}
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
                      <label className="block text-sm font-semibold text-gray-700">VA SPP</label>
                      <input
                        type="text"
                        name="VA_SPP"
                        value={form.VA_SPP}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
                        required
                      />
                    </div>


                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Ekskul</label>
                      <select
                        name="ekskul"
                        value={form.ekskul}
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
                      <label className="block text-sm font-medium">Status Santri</label>
                      <select
                        name="graduation_status"
                        value={form.graduation_status}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all bg-white"
                        required
                      >
                        <option value="" disabled>Pilih Status Kelulusan</option>
                        <option value="Aktif">Aktif</option>
                        <option value="Tidak Aktif">Tidak Aktif</option>
                        <option value="Lulus">Lulus</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-800" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-emerald-900">Data Akademik</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Move academic-related fields here */}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-800" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-lg font-semibold text-emerald-900">Data Tambahan</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Move additional fields here */}
                  </div>
                </div>

                <div className="sticky bottom-0 bg-emerald-50 py-4 border-t border-emerald-100 mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-800 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-800 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                  >
                    <span className="flex items-center gap-2">
                      Simpan
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}