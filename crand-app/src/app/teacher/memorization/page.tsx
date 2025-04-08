"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStudentMemorization, updateMemorizationData, type MemorizationStudent } from "./action";
import { useToast } from "@/components/ui/use-toast";

interface QuranMemorization {
  _id: string;
  name: string;
}

const MemorizationPage = () => {
  const [memorizationData, setMemorizationData] = useState<MemorizationStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<MemorizationStudent | null>(null);
  const [juzList, setJuzList] = useState<QuranMemorization[]>([]);
  const [selectedJuzId, setSelectedJuzId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMemorizationData();
    fetchJuzList();
  }, []);

  const fetchMemorizationData = async () => {
    try {
      setLoading(true);
      const data = await getStudentMemorization();
      setMemorizationData(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching memorization data:", error);
      setError("Gagal memuat data hafalan");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data hafalan",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJuzList = async () => {
    try {
      const response = await fetch("/api/quran-memorization");
      if (!response.ok) {
        throw new Error("Failed to fetch juz list");
      }
      const data = await response.json();
      setJuzList(data);
    } catch (error) {
      console.error("Error fetching juz list:", error);
      setError("Gagal memuat daftar juz");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat daftar juz",
      });
    }
  };

  const handleEditClick = (student: MemorizationStudent) => {
    setEditingStudent({
      ...student,
      semester: student.semester || "",
      academic_year: student.academic_year || "",
      pages: student.pages || "",
      status: student.status || "",
      notes: student.notes || "",
    });
    setSelectedJuzId(student.quran_memorization_id || "");
    setShowEditForm(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!editingStudent) return;
    const { name, value } = e.target;
    
    if (name === "quran_memorization_id") {
      setSelectedJuzId(value);
    } else {
      setEditingStudent({ ...editingStudent, [name]: value });
    }
  };

  const handleEditSubmit = async () => {
    if (!editingStudent || !selectedJuzId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mohon lengkapi semua field, termasuk pemilihan Juz",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateMemorizationData(editingStudent.id, {
        semester: editingStudent.semester,
        academic_year: editingStudent.academic_year,
        quran_memorization_id: selectedJuzId,
        pages: editingStudent.pages,
        status: editingStudent.status,
        notes: editingStudent.notes,
      });

      if (result.success) {
        setMemorizationData(prevData => 
          prevData.map(student => {
            if (student.id === editingStudent.id) {
              const selectedJuz = juzList.find(juz => juz._id === selectedJuzId);
              return {
                ...student,
                semester: editingStudent.semester,
                academic_year: editingStudent.academic_year,
                juz_name: selectedJuz?.name || student.juz_name,
                pages: editingStudent.pages,
                status: editingStudent.status,
                notes: editingStudent.notes,
                quran_memorization_id: selectedJuzId,
              };
            }
            return student;
          })
        );

        setShowEditForm(false);
        setEditingStudent(null);
        setSelectedJuzId("");
        toast({
          title: "Success",
          description: "Data berhasil disimpan",
        });
      } else {
        throw new Error("Failed to update data");
      }
    } catch (error) {
      console.error("Error updating memorization:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengupdate data hafalan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 m-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Hafalan</h1>
          <p className="text-gray-600">
            Kelola progress hafalan santri di kelas Anda
          </p>
        </div>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Daftar Hafalan Santri</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Santri</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Tahun Angkatan</TableHead>
                <TableHead>Juz</TableHead>
                <TableHead>Halaman</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memorizationData.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.semester}</TableCell>
                  <TableCell>{student.academic_year}</TableCell>
                  <TableCell>{student.juz_name}</TableCell>
                  <TableCell>{student.pages}</TableCell>
                  <TableCell>{student.status}</TableCell>
                  <TableCell>{student.notes}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(student)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hafalan</DialogTitle>
          </DialogHeader>
          <div className="mb-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Semester</label>
              <input
                type="text"
                name="semester"
                value={editingStudent?.semester || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tahun Angkatan</label>
              <input
                type="text"
                name="academic_year"
                value={editingStudent?.academic_year || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Juz</label>
              <select
                name="quran_memorization_id"
                value={selectedJuzId}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
                disabled={isSubmitting}
              >
                <option value="">Pilih Juz</option>
                {juzList.map((juz) => (
                  <option key={juz._id} value={juz._id}>
                    {juz.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Halaman</label>
              <input
                type="text"
                name="pages"
                value={editingStudent?.pages || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={editingStudent?.status || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
                disabled={isSubmitting}
              >
                <option value="">Pilih Status</option>
                <option value="Lancar">Lancar</option>
                <option value="Tidak Lancar">Tidak Lancar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Catatan</label>
              <textarea
                name="notes"
                value={editingStudent?.notes || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleEditSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemorizationPage;
