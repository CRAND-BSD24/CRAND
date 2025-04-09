"use client";

import { useEffect, useState, use } from "react";
import {
  getStudentGrades,
  StudentGrade,
  updateStudentGrade,
  getSubjects,
  deleteStudentGrade,
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
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
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

  console.log("Data yang akan ditampilkan:", grades);

  return (
    <div className="space-y-6 m-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detail Nilai Santri</h1>
            <p className="text-gray-600">
              Daftar nilai akademik santri per semester
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Nilai
        </Button>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Daftar Nilai</CardTitle>
        </CardHeader>
        <CardContent>
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
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(grade)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {grades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Belum ada data nilai
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
              <Button onClick={handleEditGrade}>Simpan</Button>
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
              <Button onClick={handleAddGrade}>Tambah</Button>
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
    </div>
  );
};

export default StudentGradesPage;
