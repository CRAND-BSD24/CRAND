"use client";

import { deleteStudentById } from "./action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDelete = async () => {
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const success = await deleteStudentById(id);
      if (success) {
        toast.success("Santri berhasil dihapus");
        router.push("/admin/prospective_students");
      } else {
        toast.error("Gagal menghapus santri. Coba lagi nanti.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus data");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        className="bg-red-500 hover:bg-red-600 text-white font-medium px-2 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Hapus
      </button>

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">Yakin ingin menghapus santri ini? Tindakan ini tidak dapat dibatalkan.</p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
