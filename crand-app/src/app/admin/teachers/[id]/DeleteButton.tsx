"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { deleteTeacher } from "@/lib/api/teacher";

export default function DeleteButton({
  teacherId,
  teacherName,
}: {
  teacherId: string;
  teacherName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTeacher(teacherId);
      
      toast({
        title: "Berhasil menghapus guru",
        description: `Data guru ${teacherName} telah dihapus`,
        variant: "default",
      });
      
      router.push("/admin/teachers");
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast({
        title: "Gagal menghapus guru",
        description: "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      });
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setIsOpen(true)}
        className="gap-2 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        <Trash2 className="h-4 w-4" />
        Hapus
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-xl bg-white">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-red-100 bg-gradient-to-r from-red-50 to-orange-50">
            <AlertTriangle className="h-6 w-6 text-red-600 mb-2" />
            <DialogTitle className="text-xl font-semibold text-red-700">Konfirmasi Hapus</DialogTitle>
            <DialogDescription className="text-red-600">
              Apakah Anda yakin ingin menghapus data guru ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6">
            <p className="mb-4 text-gray-700">
              Anda akan menghapus data guru: <span className="font-semibold text-red-700">{teacherName}</span>
            </p>
            <p className="text-sm text-gray-500">
              Semua informasi terkait guru ini akan dihapus permanen dari sistem.
            </p>
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
              className="border-gray-300 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <X className="mr-2 h-4 w-4" />
              Batal
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 transition-all duration-200"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
