'use client';

import { deleteStudentById } from "./action";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm("Yakin ingin menghapus santri ini?");
    if (!confirmed) return;

    const success = await deleteStudentById(id);
    if (success) {
      alert("Santri berhasil dihapus.");
      router.push("/admin/students"); // Ganti dengan halaman daftar santri kamu
    } else {
      alert("Gagal menghapus santri.");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Hapus
    </button>
  );
}
