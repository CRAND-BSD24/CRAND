"use client";

import { useEffect, useState } from "react";
import { createNewStudent } from "./action";
import { toast } from "sonner";

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
          fetch("/api/classes", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }),
          fetch("/api/halaqahs", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }),
        ]);

        if (!classesRes.ok) {
          throw new Error(`Failed to fetch classes: ${classesRes.statusText}`);
        }

        if (!halaqahsRes.ok) {
          throw new Error(
            `Failed to fetch halaqahs: ${halaqahsRes.statusText}`
          );
        }

        const classesData = await classesRes.json();
        const halaqahsData = await halaqahsRes.json();

        if (!Array.isArray(classesData)) {
          throw new Error("Invalid classes data format");
        }

        if (!Array.isArray(halaqahsData)) {
          throw new Error("Invalid halaqahs data format");
        }


        const formattedHalaqahs = halaqahsData.map(
          (halaqah: { _id: string; name: string }) => ({
            _id: halaqah._id,
            name: halaqah.name,
          })
        );

        setClasses(classesData);
        setHalaqahs(formattedHalaqahs);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Gagal memuat data kelas dan halaqah";
        console.error("Error fetching data:", error);
        toast.error(errorMessage);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = {
        ...form,
        level: form.level,
      };

      await createNewStudent(formData);
      toast.success("Data santri berhasil ditambahkan");
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal menambahkan data santri";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-800 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold shadow-md hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-5 sm:w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Tambah Santri
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-blue-800">
                Tambah Data Santri
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  NISN
                </label>
                <input
                  type="text"
                  name="nisn"
                  value={form.nisn}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Jenis Kelamin
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nama Ayah
                </label>
                <input
                  type="text"
                  name="father_name"
                  value={form.father_name}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tahun Akademik
                </label>
                <input
                  type="text"
                  name="academic_year"
                  value={form.academic_year}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Program
                </label>
                <select
                  name="program"
                  value={form.program}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                >
                  <option value="">Pilih Program</option>
                  <option value="Reguler">Reguler</option>
                  <option value="Shorhul Qurro">Shorhul Qurro</option>
                </select>
              </div>

              <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ekstrakurikuler</label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Kelas
                </label>
                <select
                  name="class_id"
                  value={form.class_id}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map((kelas) => (
                    <option key={kelas._id} value={kelas._id}>
                      {kelas.class_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  VA SPP
                </label>
                <input
                  type="text"
                  name="VA_SPP"
                  value={form.VA_SPP}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tempat, Tanggal Lahir
                </label>
                <input
                  type="text"
                  name="birth_place_date"
                  value={form.birth_place_date}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Alamat
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nama Ibu
                </label>
                <input
                  type="text"
                  name="mother_name"
                  value={form.mother_name}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                />
              </div>

              {/* <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Jenjang Akademik
                </label>
                <select
                  name="academic_level"
                  value={form.academic_level}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                >
                  <option value="">Pilih Jenjang</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div> */}

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
                <label className="block text-sm font-medium text-gray-700">
                  Level
                </label>
                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                >
                  <option value="">Pilih Level</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Halaqah
                </label>
                <select
                  name="halaqah_id"
                  value={form.halaqah_id}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                >
                  <option value="">Pilih Halaqah</option>
                  {halaqahs.map((halaqah) => (
                    <option key={halaqah._id} value={halaqah._id}>
                      {halaqah.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status Kelulusan
                </label>
                <select
                  name="graduation_status"
                  value={form.graduation_status}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition-all"
                >
                  <option value="">Pilih Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Drop Out">Drop Out</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-blue-800 text-white hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
