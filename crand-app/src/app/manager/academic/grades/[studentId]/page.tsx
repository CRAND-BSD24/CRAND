"use client";

import { useEffect, useState, use } from "react";
import {
  getStudentGrades,
  StudentGrade,
  updateStudentGrade,
  getSubjects,
  deleteStudentGrade,
  getGradeHistory,
} from "../action";
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
import { ArrowLeft, Pencil, Plus, Trash2, History, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

interface PageProps {
  params: Promise<{
    studentId: string;
  }>;
}

interface Subject {
  _id: string;
  name: string;
}

interface EditForm {
  subject_name: string;
  score: number | string;
  semester: string;
  academic_year: string;
}

const StudentGradesPage = ({ params }: PageProps) => {
  const router = useRouter();
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<StudentGrade | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    subject_name: "",
    score: "",
    semester: "",
    academic_year: "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGrade, setNewGrade] = useState({
    subject_name: "",
    score: 0,
    semester: "",
    academic_year: "",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<StudentGrade | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedGradeHistory, setSelectedGradeHistory] = useState<StudentGrade | null>(null);
  const [gradeHistory, setGradeHistory] = useState<StudentGrade[]>([]);

  const resolvedParams = use(params);
  const studentId = resolvedParams.studentId;

  console.log("StudentId yang diterima:", studentId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subjects using server action
        const subjectsData = await getSubjects();
        setSubjects(subjectsData);

        // Fetch grades using server action
        const gradesData = await getStudentGrades(studentId);
        setGrades(gradesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const handleEditClick = (grade: StudentGrade) => {
    setSelectedGrade(grade);
    setEditForm({
      subject_name: grade.subject_name,
      score: grade.score.toString(),
      semester: grade.semester.toString(),
      academic_year: grade.academic_year,
    });
    setShowEditForm(true);
  };

  const handleEditGrade = async () => {
    try {
      // Validasi input
      if (!selectedGrade) return;

      const score = parseInt(editForm.score.toString());
      if (isNaN(score)) {
        throw new Error("Nilai harus berupa angka");
      }

      await updateStudentGrade(
        studentId,
        selectedGrade.subject_name,
        score,
        editForm.semester,
        editForm.academic_year
      );

      // Refresh data
      const updatedGrades = await getStudentGrades(studentId);
      setGrades(updatedGrades);
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating grade:", error);
      setError("Gagal memperbarui nilai");
    }
  };

  const handleAddGrade = async () => {
    try {
      // Validasi input
      const score = parseInt(newGrade.score.toString());
      if (isNaN(score)) {
        throw new Error("Nilai harus berupa angka");
      }

      if (
        !newGrade.subject_name ||
        !newGrade.semester ||
        !newGrade.academic_year
      ) {
        throw new Error("Semua field harus diisi");
      }

      await updateStudentGrade(
        studentId,
        newGrade.subject_name,
        score,
        newGrade.semester,
        newGrade.academic_year
      );

      // Refresh data
      const updatedGrades = await getStudentGrades(studentId);
      setGrades(updatedGrades);
      setIsAddDialogOpen(false);
      setNewGrade({
        subject_name: "",
        score: 0,
        semester: "",
        academic_year: "",
      });
    } catch (error) {
      console.error("Error adding grade:", error);
      setError("Gagal menambahkan nilai");
    }
  };

  const handleDeleteClick = (grade: StudentGrade) => {
    setGradeToDelete(grade);
    setShowDeleteDialog(true);
  };

  const handleDeleteGrade = async () => {
    try {
      if (!gradeToDelete) return;

      await deleteStudentGrade(studentId, gradeToDelete.subject_name);

      // Refresh data
      const updatedGrades = await getStudentGrades(studentId);
      setGrades(updatedGrades);
      setShowDeleteDialog(false);
      setGradeToDelete(null);
    } catch (error) {
      console.error("Error deleting grade:", error);
      setError("Gagal menghapus nilai");
    }
  };

  const handleHistoryClick = async (grade: StudentGrade) => {
    setSelectedGradeHistory(grade);
    try {
      const history = await getGradeHistory(studentId, grade.subject_name);
      setGradeHistory(history);
      setShowHistoryDialog(true);
    } catch (error) {
      console.error("Error fetching grade history:", error);
      setError("Gagal mengambil riwayat nilai");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e2f6f4] flex items-center justify-center px-4 lg:pl-64 pt-16">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-800 rounded-full animate-spin mb-4"></div>
          <div className="text-blue-800 text-base font-medium">Loading data...</div>
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

  console.log("Data yang akan ditampilkan:", grades);

  return (
    <main className="min-h-screen bg-[#e2f6f4] pt-16">
      <div className="lg:pl-1">
        <div className="pl-4 pr-4 sm:pl-6 lg:pl-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2 text-blue-800 hover:bg-blue-50" 
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 bg-blue-700 text-white rounded-lg mr-3">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-800">Detail Nilai Santri</h1>
                <p className="text-blue-600 text-sm">
                  Daftar nilai akademik santri per semester
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white mt-4 sm:mt-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Nilai
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-blue-800 flex items-center">
                <div className="w-1 h-5 bg-blue-600 rounded-full mr-2"></div>
                Daftar Nilai
              </h3>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Tahun Akademik</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade, index) => (
                    <TableRow key={index}>
                      <TableCell>{grade.subject_name}</TableCell>
                      <TableCell>{grade.score}</TableCell>
                      <TableCell>{grade.semester}</TableCell>
                      <TableCell>{grade.academic_year}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(grade)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleHistoryClick(grade)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(grade)}
                            className="text-red-500 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {grades.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        Belum ada data nilai
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Nilai</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Mata Pelajaran</Label>
              <Input id="subject" value={editForm.subject_name} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Nilai</Label>
              <Input
                id="score"
                type="number"
                value={editForm.score || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditForm({
                    ...editForm,
                    score: value ? parseInt(value) : "",
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={editForm.semester}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, semester: value })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ganjil">Ganjil</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="academic_year">Tahun Akademik</Label>
              <Input
                id="academic_year"
                value={editForm.academic_year}
                onChange={(e) =>
                  setEditForm({ ...editForm, academic_year: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditForm(false)}>
                Batal
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleEditGrade}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Nilai</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Mata Pelajaran</Label>
              <Select
                value={newGrade.subject_name}
                onValueChange={(value) =>
                  setNewGrade({ ...newGrade, subject_name: value })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Pilih mata pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Nilai</Label>
              <Input
                id="score"
                type="number"
                value={newGrade.score || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewGrade({
                    ...newGrade,
                    score: value ? parseInt(value) : 0,
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={newGrade.semester}
                onValueChange={(value) =>
                  setNewGrade({ ...newGrade, semester: value })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ganjil">Ganjil</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="academic_year">Tahun Akademik</Label>
              <Input
                id="academic_year"
                value={newGrade.academic_year}
                onChange={(e) =>
                  setNewGrade({ ...newGrade, academic_year: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Batal
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddGrade}>Tambah</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Nilai</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus nilai{" "}
              {gradeToDelete?.subject_name}? Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleDeleteGrade}
              className="bg-red-500 hover:bg-red-600"
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Riwayat Nilai {selectedGradeHistory?.subject_name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nilai</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Tahun Akademik</TableHead>
                  <TableHead>Tanggal Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradeHistory.map((grade, index) => (
                  <TableRow key={index}>
                    <TableCell>{grade.score}</TableCell>
                    <TableCell>{grade.semester}</TableCell>
                    <TableCell>{grade.academic_year}</TableCell>
                    <TableCell>
                      {grade.created_at ? new Date(grade.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {gradeHistory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      Tidak ada riwayat nilai
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button className="bg-blue-600 hover:bg-blue-700" variant="default" onClick={() => setShowHistoryDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default StudentGradesPage;
