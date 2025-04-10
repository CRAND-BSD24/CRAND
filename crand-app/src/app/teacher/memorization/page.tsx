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
import { Pencil, History, Plus, BookOpen } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getStudentMemorization,
  updateMemorizationData,
  addMemorizationData,
  getMemorizationHistory,
  type MemorizationStudent,
  type MemorizationHistory,
} from "./action";
import { useToast } from "@/components/ui/use-toast";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { id } from "date-fns/locale";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { toast } from "sonner";

interface QuranMemorization {
  _id: string;
  name: string;
}

const MemorizationPage = () => {
  const [memorizationData, setMemorizationData] = useState<
    MemorizationStudent[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingStudent, setEditingStudent] =
    useState<MemorizationStudent | null>(null);
  const [selectedStudent, setSelectedStudent] =
    useState<MemorizationStudent | null>(null);
  const [historyData, setHistoryData] = useState<MemorizationHistory[]>([]);
  const [juzList, setJuzList] = useState<QuranMemorization[]>([]);
  const [selectedJuzId, setSelectedJuzId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMemorization, setNewMemorization] = useState({
    semester: "",
    academic_year: "",
    pages: "",
    status: "",
    notes: "",
  });
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const fetchMemorizationData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStudentMemorization();
      setMemorizationData(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching memorization data:", error);
      setError("Gagal memuat data hafalan");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJuzList = useCallback(async () => {
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
      toast.error("Gagal memuat daftar juz");
    }
  }, []);

  useEffect(() => {
    fetchMemorizationData();
    fetchJuzList();
  }, [fetchMemorizationData, fetchJuzList]);

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
      toast.error("Mohon lengkapi semua field, termasuk pemilihan Juz");
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
        setMemorizationData((prevData) =>
          prevData.map((student) => {
            if (student.id === editingStudent.id) {
              const selectedJuz = juzList.find(
                (juz) => juz._id === selectedJuzId
              );
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
        toast.success("Data berhasil disimpan");
      } else {
        throw new Error("Failed to update data");
      }
    } catch (error) {
      console.error("Error updating memorization:", error);
      toast.error("Gagal mengupdate data hafalan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClick = (student: MemorizationStudent) => {
    setSelectedStudent(student);
    setNewMemorization({
      semester: "",
      academic_year: "",
      pages: "",
      status: "",
      notes: "",
    });
    setSelectedJuzId("");
    setShowAddForm(true);
  };

  const handleAddInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewMemorization((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHistoryClick = async (student: MemorizationStudent) => {
    try {
      setLoading(true);
      const startOfCurrentWeek = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start from Monday
      const endOfCurrentWeek = endOfWeek(currentWeek, { weekStartsOn: 1 }); // End on Sunday
      const history = await getMemorizationHistory(
        student.id,
        startOfCurrentWeek,
        endOfCurrentWeek
      );
      setHistoryData(history);
      setSelectedStudent(student);
      setShowHistory(true);
      console.log(selectedStudent, "selectedStudent<><>NIH");
      console.log(memorizationData, "memorizationData<><>NIH");
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Gagal memuat riwayat hafalan");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = async () => {
    const newWeek = subWeeks(currentWeek, 1);
    setCurrentWeek(newWeek);
    if (selectedStudent) {
      try {
        setLoading(true);
        const weekStart = startOfWeek(newWeek, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(newWeek, { weekStartsOn: 1 });
        const history = await getMemorizationHistory(
          selectedStudent.id,
          weekStart,
          weekEnd
        );
        setHistoryData(history);
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("Gagal memuat riwayat hafalan");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNextWeek = async () => {
    const newWeek = addWeeks(currentWeek, 1);
    setCurrentWeek(newWeek);
    if (selectedStudent) {
      try {
        setLoading(true);
        const weekStart = startOfWeek(newWeek, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(newWeek, { weekStartsOn: 1 });
        const history = await getMemorizationHistory(
          selectedStudent.id,
          weekStart,
          weekEnd
        );
        setHistoryData(history);
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("Gagal memuat riwayat hafalan");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCurrentWeek = async () => {
    const newWeek = new Date();
    setCurrentWeek(newWeek);
    if (selectedStudent) {
      try {
        setLoading(true);
        const weekStart = startOfWeek(newWeek, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(newWeek, { weekStartsOn: 1 });
        const history = await getMemorizationHistory(
          selectedStudent.id,
          weekStart,
          weekEnd
        );
        setHistoryData(history);
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("Gagal memuat riwayat hafalan");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddSubmit = async () => {
    if (!selectedStudent || !selectedJuzId) {
      toast.error("Mohon lengkapi semua field, termasuk pemilihan Juz");
      return;
    }

    // Validate required fields
    if (
      !newMemorization.semester ||
      !newMemorization.academic_year ||
      !newMemorization.pages ||
      !newMemorization.status
    ) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addMemorizationData(selectedStudent.id, {
        semester: newMemorization.semester,
        academic_year: newMemorization.academic_year,
        quran_memorization_id: selectedJuzId,
        pages: newMemorization.pages,
        status: newMemorization.status,
        notes: newMemorization.notes,
      });

      if (result.success) {
        // Update the local state instead of refreshing
        setMemorizationData((prevData) =>
          prevData.map((student) => {
            if (student.id === selectedStudent.id) {
              const selectedJuz = juzList.find(
                (juz) => juz._id === selectedJuzId
              );
              return {
                ...student,
                semester: newMemorization.semester,
                academic_year: newMemorization.academic_year,
                juz_name: selectedJuz?.name || student.juz_name,
                pages: newMemorization.pages,
                status: newMemorization.status,
                notes: newMemorization.notes,
                quran_memorization_id: selectedJuzId,
                created_at: new Date(),
              };
            }
            return student;
          })
        );

        setShowAddForm(false);
        setSelectedStudent(null);
        setSelectedJuzId("");
        setNewMemorization({
          semester: "",
          academic_year: "",
          pages: "",
          status: "",
          notes: "",
        });
        toast.success("Data hafalan berhasil ditambahkan");
      } else {
        throw new Error("Failed to add data");
      }
    } catch (error) {
      console.error("Error adding memorization:", error);
      toast.error("Gagal menambahkan data hafalan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e2f6f4] flex items-center justify-center px-4 lg:pl-64 pt-16">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-800 rounded-full animate-spin mb-4"></div>
          <div className="text-emerald-800 text-base font-medium">Loading data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#e2f6f4] flex items-center justify-center px-4 lg:pl-64 pt-16 text-red-500 font-medium">
        {error}
      </div>
    );
  }

  // handler for sending email
  const sendPDF = async (emailAddress: string) => {
    if (!selectedStudent || !historyData.length) {
      toast.error("Data santri atau riwayat hafalan belum tersedia");
      return;
    }

    if (!emailAddress) {
      toast.error(
        "Email santri tidak tersedia. Silakan lengkapi data email santri terlebih dahulu"
      );
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 900]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header Judul
    page.drawText("LAPORAN RIWAYAT HAFALAN", {
      x: width / 2 - 130,
      y: height - 50,
      size: 16,
      font,
      color: rgb(0, 0, 0),
    });

    // Subheader Nama Santri
    page.drawText(`Nama Santri: ${selectedStudent.name}`, {
      x: 50,
      y: height - 80,
      size: 12,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Tabel Hafalan
    const tableTop = height - 120;
    const rowHeight = 24;
    const colWidths = [70, 60, 60, 60, 60, 90, 120];

    // Header tabel
    const headers = [
      "Tanggal",
      "Semester",
      "Tahun",
      "Juz",
      "Halaman",
      "Status",
      "Catatan",
    ];
    headers.forEach((header, i) => {
      const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      page.drawText(header, {
        x,
        y: tableTop,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
    });

    // Garis bawah header
    page.drawLine({
      start: { x: 50, y: tableTop - 5 },
      end: { x: width - 50, y: tableTop - 5 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // Isi tabel
    historyData.forEach((record, index) => {
      const y = tableTop - (index + 1) * rowHeight;
      const row = [
        new Date(record.created_at).toLocaleDateString("id-ID"),
        record.semester,
        record.academic_year,
        record.juz_name,
        record.pages.toString(),
        record.status,
        record.notes ?? "-",
      ];

      row.forEach((text, i) => {
        const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        page.drawText(text, {
          x,
          y,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        });
      });

      // Garis bawah setiap baris
      page.drawLine({
        start: { x: 50, y: y - 4 },
        end: { x: width - 50, y: y - 4 },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
      });
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    // Kirim ke API
    try {
      const response = await fetch("/api/sendHafalanEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailAddress,
          pdfBase64,
          studentName: selectedStudent.name,
        }),
      });

      const result = await response.json();
      if (result.message) {
        toast.success("Berhasil mengirim email");
      } else {
        throw new Error("Gagal mengirim email");
      }
    } catch (error) {
      console.error("Gagal kirim email:", error);
      toast.error("Gagal mengirim email. Coba lagi nanti");
    }
  };

  return (
    <main className="min-h-screen bg-[#e2f6f4] pt-16">
      <div className="lg:pl-1">
        <div className="pl-4 pr-4 sm:pl-6 lg:pl-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-700 text-white rounded-lg mr-3">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-emerald-800">Manajemen Hafalan</h1>
                <p className="text-emerald-600 text-sm">
                  Kelola progress hafalan santri di kelas Anda
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-emerald-800 flex items-center">
                <div className="w-1 h-5 bg-emerald-600 rounded-full mr-2"></div>
                Daftar Hafalan Santri
              </h3>
            </div>
            <div className="p-4">
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
                    <TableHead>Tanggal</TableHead>
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
                        {student.created_at
                          ? format(new Date(student.created_at), "dd MMMM yyyy", {
                              locale: id,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-emerald-50 text-emerald-600 border-emerald-200"
                          onClick={() => handleEditClick(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-emerald-50 text-emerald-600 border-emerald-200"
                          onClick={() => handleAddClick(student)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-emerald-50 text-emerald-600 border-emerald-200"
                          onClick={() => handleHistoryClick(student)}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hafalan</DialogTitle>
          </DialogHeader>
          <div className="mb-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Semester</label>
              <input
                type="text"
                name="semester"
                value={editingStudent?.semester || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">
                Tahun Angkatan
              </label>
              <input
                type="text"
                name="academic_year"
                value={editingStudent?.academic_year || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Juz</label>
              <select
                name="quran_memorization_id"
                value={selectedJuzId}
                onChange={handleInputChange}
                className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
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
              <label className="block text-sm font-medium text-emerald-800 mb-1">Halaman</label>
              <input
                type="text"
                name="pages"
                value={editingStudent?.pages || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Status</label>
              <select
                name="status"
                value={editingStudent?.status || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={isSubmitting}
              >
                <option value="">Pilih Status</option>
                <option value="Lancar">Lancar</option>
                <option value="Tidak Lancar">Tidak Lancar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Catatan</label>
              <textarea
                name="notes"
                value={editingStudent?.notes || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleEditSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Hafalan Baru</DialogTitle>
          </DialogHeader>
          <div className="mb-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Semester</label>
              <input
                type="text"
                name="semester"
                value={newMemorization.semester}
                onChange={handleAddInputChange}
                className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">
                Tahun Angkatan
              </label>
              <input
                type="text"
                name="academic_year"
                value={newMemorization.academic_year}
                onChange={handleAddInputChange}
                className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Juz</label>
              <select
                name="quran_memorization_id"
                value={selectedJuzId}
                onChange={(e) => setSelectedJuzId(e.target.value)}
                className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
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
              <label className="block text-sm font-medium text-emerald-800 mb-1">Halaman</label>
              <input
                type="text"
                name="pages"
                value={newMemorization.pages}
                onChange={handleAddInputChange}
                className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Status</label>
              <select
                name="status"
                value={newMemorization.status}
                onChange={handleAddInputChange}
                className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={isSubmitting}
              >
                <option value="">Pilih Status</option>
                <option value="Lancar">Lancar</option>
                <option value="Tidak Lancar">Tidak Lancar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Catatan</label>
              <textarea
                name="notes"
                value={newMemorization.notes}
                onChange={handleAddInputChange}
                className="w-full p-2 border border-emerald-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleAddSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Tambah Hafalan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Riwayat Hafalan {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-emerald-50 text-emerald-600 border-emerald-200"
                onClick={handlePreviousWeek}
                disabled={loading}
              >
                Minggu Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-emerald-50 text-emerald-600 border-emerald-200"
                onClick={handleCurrentWeek}
                disabled={loading}
              >
                Minggu Ini
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-emerald-50 text-emerald-600 border-emerald-200"
                onClick={handleNextWeek}
                disabled={loading}
              >
                Minggu Berikutnya
              </Button>
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              size="sm"
              onClick={() => sendPDF(selectedStudent?.email || "")}
              disabled={loading || !selectedStudent}
            >
              Kirim Email PDF
            </Button>
            <div className="text-sm text-emerald-600">
              {format(
                startOfWeek(currentWeek, { weekStartsOn: 1 }),
                "dd MMMM yyyy",
                { locale: id }
              )}{" "}
              -
              {format(
                endOfWeek(currentWeek, { weekStartsOn: 1 }),
                "dd MMMM yyyy",
                { locale: id }
              )}
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800"></div>
              </div>
            ) : historyData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Tahun Angkatan</TableHead>
                    <TableHead>Juz</TableHead>
                    <TableHead>Halaman</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.created_at), "dd MMMM yyyy", {
                          locale: id,
                        })}
                      </TableCell>
                      <TableCell>{record.semester}</TableCell>
                      <TableCell>{record.academic_year}</TableCell>
                      <TableCell>{record.juz_name}</TableCell>
                      <TableCell>{record.pages}</TableCell>
                      <TableCell>{record.status}</TableCell>
                      <TableCell>{record.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex justify-center items-center h-32 text-emerald-600">
                Tidak ada setoran hafalan di minggu ini
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default MemorizationPage;
