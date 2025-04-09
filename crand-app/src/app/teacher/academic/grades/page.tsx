"use client";

import { useEffect, useState } from "react";
import { getStudentGrades, StudentGrade, updateStudentGrade } from "./action";
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
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditGradeForm {
  subject_name: string;
  score: number;
  semester: string;
  academic_year: string;
}

interface AddGradeForm {
  subject_name: string;
  score: number;
  semester: string;
  academic_year: string;
}

export default function StudentGradesPage({
  params,
}: {
  params: { studentId: string };
}) {
  const router = useRouter();
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingGrade, setEditingGrade] = useState<EditGradeForm | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGrade, setNewGrade] = useState<AddGradeForm>({
    subject_name: "",
    score: 0,
    semester: "",
    academic_year: "",
  });

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await getStudentGrades(params.studentId);
        setGrades(data);
      } catch (error) {
        console.error("Error fetching grades:", error);
        setError("Gagal memuat data nilai");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [params.studentId]);

  const handleEditClick = (grade: StudentGrade) => {
    setEditingGrade(grade);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingGrade) return;

    try {
      await updateStudentGrade(
        params.studentId,
        editingGrade.subject_name,
        editingGrade.score,
        editingGrade.semester,
        editingGrade.academic_year
      );

      // Refresh data setelah update
      const updatedGrades = await getStudentGrades(params.studentId);
      setGrades(updatedGrades);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating grade:", error);
      setError("Gagal mengupdate nilai");
    }
  };

  const handleAddGrade = async () => {
    try {
      await updateStudentGrade(
        params.studentId,
        newGrade.subject_name,
        newGrade.score,
        newGrade.semester,
        newGrade.academic_year
      );

      // Refresh data setelah menambah
      const updatedGrades = await getStudentGrades(params.studentId);
      setGrades(updatedGrades);
      setIsAddDialogOpen(false);
      // Reset form
      setNewGrade({
        subject_name: "",
        score: 0,
        semester: "",
        academic_year: "",
      });
    } catch (error) {
      console.error("Error adding grade:", error);
      setError("Gagal menambah nilai");
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
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-black"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Nilai
          </Button>
        </div>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(grade)}
                    >
                      Edit
                    </Button>
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

      {/* Dialog Edit */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Nilai</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="score" className="text-right">
                Nilai
              </Label>
              <Input
                id="score"
                type="number"
                value={editingGrade?.score || 0}
                onChange={(e) =>
                  setEditingGrade({
                    ...editingGrade!,
                    score: parseInt(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="semester" className="text-right">
                Semester
              </Label>
              <Select
                value={editingGrade?.semester || ""}
                onValueChange={(value) =>
                  setEditingGrade({
                    ...editingGrade!,
                    semester: value,
                  })
                }
              >
                <SelectTrigger className="col-span-3 bg-white">
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ganjil">Ganjil</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="academic_year" className="text-right">
                Tahun Akademik
              </Label>
              <Input
                id="academic_year"
                value={editingGrade?.academic_year || ""}
                onChange={(e) =>
                  setEditingGrade({
                    ...editingGrade!,
                    academic_year: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Batal
            </Button>
            <Button onClick={handleSaveEdit}>Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Nilai</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject_name" className="text-right">
                Mata Pelajaran
              </Label>
              <Input
                id="subject_name"
                value={newGrade.subject_name}
                onChange={(e) =>
                  setNewGrade({
                    ...newGrade,
                    subject_name: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="score" className="text-right">
                Nilai
              </Label>
              <Input
                id="score"
                type="number"
                value={newGrade.score}
                onChange={(e) =>
                  setNewGrade({
                    ...newGrade,
                    score: parseInt(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="semester" className="text-right">
                Semester
              </Label>
              <Select
                value={newGrade.semester}
                onValueChange={(value) =>
                  setNewGrade({
                    ...newGrade,
                    semester: value,
                  })
                }
              >
                <SelectTrigger className="col-span-3 bg-white">
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ganjil">Ganjil</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="academic_year" className="text-right">
                Tahun Akademik
              </Label>
              <Input
                id="academic_year"
                value={newGrade.academic_year}
                onChange={(e) =>
                  setNewGrade({
                    ...newGrade,
                    academic_year: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddGrade}>Tambah</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
