"use client";

import { deleteStudent } from "../action";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus santri ini?")) {
      const success = await deleteStudent(id);
      if (success) {
        toast.success("Santri berhasil dihapus.", {
          position: "top-right",
          autoClose: 3000,
        });
        router.push("/admin/students");
        router.refresh();
      } else {
        toast.error("Gagal menghapus santri.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
    >
      Hapus Santri
    </button>
  );
}