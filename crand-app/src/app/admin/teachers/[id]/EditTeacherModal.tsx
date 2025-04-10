"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { X, Save, Loader2 } from "lucide-react";
import { updateTeacher, Teacher } from "@/lib/api/teacher";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nama harus minimal 2 karakter.",
  }),
  email: z.string().email({
    message: "Email tidak valid.",
  }),
  nip: z.string().min(1, {
    message: "NIP tidak boleh kosong.",
  }),
  phone: z.string().optional(),
  subject: z.string().optional(),
});



export default function EditTeacherModal({
  teacher,
  isOpen,
  onClose,
  onSuccess,
}: {
  teacher: Teacher;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: teacher.user_id.name,
      email: teacher.user_id.email,
      nip: teacher.nip,
      phone: teacher.phone || "",
      subject: teacher.subject || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      // Update teacher data
      await updateTeacher(teacher._id, {
        userId: teacher.user_id._id,
        name: values.name,
        email: values.email,
        nip: values.nip,
        phone: values.phone || null,
        subject: values.subject || null,
      });

      toast({
        title: "Berhasil menyimpan data guru",
        description: "Data guru telah diperbarui",
        variant: "default",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast({
        title: "Gagal menyimpan data guru",
        description: "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] p-0 overflow-hidden rounded-xl bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
          <DialogTitle className="text-2xl font-semibold text-emerald-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Data Guru
          </DialogTitle>
          <DialogDescription className="text-emerald-600">
            Perbarui informasi guru di bawah ini.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-700 font-medium">Nama</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Masukkan nama guru" 
                        {...field} 
                        className="border-emerald-300 focus-visible:ring-emerald-800"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-700 font-medium">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Masukkan email" 
                        {...field} 
                        className="border-emerald-300 focus-visible:ring-emerald-800"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nip"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-700 font-medium">NIP</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Masukkan NIP" 
                        {...field} 
                        className="border-emerald-300 focus-visible:ring-emerald-800"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-700 font-medium">Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Masukkan nomor telepon" 
                        {...field} 
                        className="border-emerald-300 focus-visible:ring-emerald-800"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }: { field: any }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-emerald-700 font-medium">Mata Pelajaran</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Masukkan mata pelajaran" 
                        {...field} 
                        className="border-emerald-300 focus-visible:ring-emerald-800"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-emerald-800 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-200"
              >
                <X className="mr-2 h-4 w-4" />
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-emerald-800 hover:bg-emerald-700 text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
