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
import { BookText } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStudentMemorization, updateMemorizationStatus, addNewMemorization, type MemorizationStudent } from "./action";

const MemorizationPage = () => {
  const [memorizationData, setMemorizationData] = useState<MemorizationStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newMemorization, setNewMemorization] = useState({
    student_id: "",
    semester: "",
    academic_year: "",
    juz_name: "",
    pages: "",
    status: "",
    notes: "",
  });

  useEffect(() => {
    fetchMemorizationData();
  }, []);

  const fetchMemorizationData = async () => {
    try {
      const data = await getStudentMemorization();
      setMemorizationData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching memorization data:", error);
      setError("Gagal memuat data hafalan");
      setLoading(false);
    }
  };

  const handleStatusChange = async (studentId: string, newStatus: string) => {
    try {
      const student = memorizationData.find((s) => s.id === studentId);
      if (!student) return;

      await updateMemorizationStatus(studentId, {
        status: newStatus,
        notes: student.notes,
      });

      // Update local state
      setMemorizationData((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, status: newStatus } : s
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal mengupdate status hafalan");
    }
  };

  const handleNotesChange = async (studentId: string, newNotes: string) => {
    try {
      const student = memorizationData.find((s) => s.id === studentId);
      if (!student) return;

      await updateMemorizationStatus(studentId, {
        status: student.status,
        notes: newNotes,
      });

      // Update local state
      setMemorizationData((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, notes: newNotes } : s
        )
      );
    } catch (error) {
      console.error("Error updating notes:", error);
      alert("Gagal mengupdate catatan hafalan");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewMemorization({ ...newMemorization, [name]: value });
  };

  const addMemorizationData = async () => {
    try {
      await addNewMemorization({
        student_id: newMemorization.student_id,
        semester: newMemorization.semester,
        academic_year: newMemorization.academic_year,
        juz_name: newMemorization.juz_name,
        pages: newMemorization.pages,
        status: newMemorization.status,
        notes: newMemorization.notes,
      });

      // Refresh data
      await fetchMemorizationData();

      // Reset form
      setNewMemorization({
        student_id: "",
        semester: "",
        academic_year: "",
        juz_name: "",
        pages: "",
        status: "",
        notes: "",
      });

      setShowForm(false);
    } catch (error) {
      console.error("Error adding memorization:", error);
      alert("Gagal menambahkan data hafalan");
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
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowForm(true)}
        >
          <BookText className="mr-2 h-4 w-4" />
          Tambah Hafalan
        </Button>
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
                <TableHead>Kelas</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Tahun Angkatan</TableHead>
                <TableHead>Juz</TableHead>
                <TableHead>Halaman</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memorizationData.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class_name}</TableCell>
                  <TableCell>{student.semester}</TableCell>
                  <TableCell>{student.academic_year}</TableCell>
                  <TableCell>{student.juz_name}</TableCell>
                  <TableCell>{student.pages}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant={
                          student.status === "Lancar" ? "default" : "outline"
                        }
                        size="sm"
                        className="hover:bg-green-50"
                        onClick={() => handleStatusChange(student.id, "Lancar")}
                      >
                        Lancar
                      </Button>
                      <Button
                        variant={
                          student.status === "Tidak Lancar"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="hover:bg-red-50"
                        onClick={() =>
                          handleStatusChange(student.id, "Tidak Lancar")
                        }
                      >
                        Tidak Lancar
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="Tambahkan catatan..."
                      value={student.notes}
                      onChange={(e) =>
                        handleNotesChange(student.id, e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Hafalan Baru</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <input
              type="text"
              name="student_id"
              placeholder="ID Santri"
              value={newMemorization.student_id}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="semester"
              placeholder="Semester"
              value={newMemorization.semester}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="academic_year"
              placeholder="Tahun Angkatan"
              value={newMemorization.academic_year}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="juz_name"
              placeholder="Juz"
              value={newMemorization.juz_name}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="pages"
              placeholder="Halaman"
              value={newMemorization.pages}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="status"
              placeholder="Status"
              value={newMemorization.status}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <textarea
              name="notes"
              placeholder="Catatan"
              value={newMemorization.notes}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border border-gray-300 rounded"
            />
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={addMemorizationData}
            >
              Simpan Hafalan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemorizationPage;
