"use client";

import { useState, useEffect } from "react";
import { updateStudentById } from "./action";
import { useRouter } from "next/navigation";

interface Student {
  _id: string;
  name: string;
  class: string;
  class_id: string | null;
  academic_level: string;
  gender: string;
  parent_name: string;
  batch_year: number;
  birth_date: string;
  birth_place: string;
  address: string;
  email: string;
  phone_number: string;
  profile_picture?: string;
  graduation_status: string;
  payment_status: string;
}

interface Class {
  _id: string;
  class_name: string;
}

export default function EditStudentModal({ student }: { student: Student }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, []);

  const [form, setForm] = useState({
    name: student.name || "",
    class_id: student.class_id || "",
    academic_level: student.academic_level || "",
    gender: student.gender || "",
    parent_name: student.parent_name || "",
    batch_year: student.batch_year?.toString() || "",
    birth_date: student.birth_date
      ? new Date(student.birth_date).toISOString().split("T")[0]
      : "",
    birth_place: student.birth_place || "",
    address: student.address || "",
    email: student.email || "",
    phone_number: student.phone_number || "",
    profile_picture: student.profile_picture || "",
    graduation_status: student.graduation_status || "Aktif",
    payment_status: student.payment_status || "Lunas",
  });

  useEffect(() => {
    console.log("Student data received:", student);
    console.log("Phone number from student:", student.phone_number);
    console.log("Current form state:", form);
    console.log("Phone number in form:", form.phone_number);
  }, [student, form]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name) {
      setError("Nama lengkap harus diisi");
      return;
    }
    if (!form.class_id) {
      setError("Kelas harus diisi");
      return;
    }
    if (!form.gender) {
      setError("Jenis kelamin harus dipilih");
      return;
    }
    if (!form.birth_date) {
      setError("Tanggal lahir harus diisi");
      return;
    }
    if (!form.batch_year) {
      setError("Tahun angkatan harus diisi");
      return;
    }

    const updatedForm = {
      ...form,
      batch_year: Number(form.batch_year),
    };

    const success = await updateStudentById(student._id, updatedForm);

    if (success) {
      alert("Data berhasil diperbarui.");
      setIsOpen(false);
      router.refresh();
    } else {
      setError("Gagal memperbarui data. Silakan coba lagi.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl space-y-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-2 text-[#006A71]">Edit Data Santri</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Kelas</label>
                <select
                  name="class_id"
                  value={form.class_id}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.class_name}
                    </option>
                  ))}
                </select>
              </div>

              {[
                { label: "Nama Lengkap", name: "name" },
                { label: "Tingkat Akademik", name: "academic_level" },
                { label: "Nama Orang Tua", name: "parent_name" },
                { label: "Tahun Angkatan", name: "batch_year", type: "number" },
                { label: "Tempat Lahir", name: "birth_place" },
                { label: "Alamat Lengkap", name: "address" },
                { label: "Email", name: "email", type: "email" },
                { label: "Nomor HP", name: "phone_number" },
                { label: "URL Foto Profil", name: "profile_picture" },
              ].map(({ label, name, type = "text" }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700">{label}</label>
                  <input
                    name={name}
                    type={type}
                    value={(form as any)[name]}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status Kelulusan</label>
                <select
                  name="graduation_status"
                  value={form.graduation_status}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Drop Out">Drop Out</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status Pembayaran</label>
                <select
                  name="payment_status"
                  value={form.payment_status}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="Lunas">Lunas</option>
                  <option value="Belum Lunas">Belum Lunas</option>
                  <option value="Cicilan">Cicilan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                <input
                  type="date"
                  name="birth_date"
                  value={form.birth_date}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
