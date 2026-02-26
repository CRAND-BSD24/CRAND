"use client";

import { useEffect, useState, use } from "react";
import {
  getStudentGrades,
  StudentGrade,
  updateStudentGrade,
  getSubjects,
  deleteStudentGrade,
  getGradeHistory,
} from "@/app/teacher/academic/grades/action";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subjectsData = await getSubjects();
        setSubjects(subjectsData);

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
      score: (grade as any).score?.toString?.() ?? grade.score,
      semester: grade.semester.toString(),
      academic_year: grade.academic_year,
    });
    setShowEditForm(true);
  };

  const handleEditGrade = async () => {
    try {
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
      const score = parseInt(newGrade.score.toString());
      if (isNaN(score)) {
        throw new Error("Nilai harus berupa angka");
      }

      if (!newGrade.subject_name || !newGrade.semester || !newGrade.academic_year) {
        throw new Error("Semua field harus diisi");
      }

      await updateStudentGrade(
        studentId,
        newGrade.subject_name,
        score,
        newGrade.semester,
        newGrade.academic_year
      );

      const updatedGrades = await getStudentGrades(studentId);
      setGrades(updatedGrades);
      setIsAddDialogOpen(false);
      setNewGrade({ subject_name: "", score: 0, semester: "", academic_year: "" });
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

  return (
    <main className="min-h-screen bg-[#e2f6f4] pt-16">
      <div className="lg:pl-1">
        <div className="pl-4 pr-4 sm:pl-6 lg:pl-8">
          <div className="flex items-center mb-5 bg-white rounded-xl shadow-sm p-4">
            <Button
              variant="ghost"
              className="text-blue-700 hover:bg-blue-50"
              onClick={() => router.push("/educator/academic")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
            </Button>
          </div>

          <Card className="bg-white rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Nilai Santri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" /> Tambah Nilai
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Nilai</DialogTitle>
                      <DialogDescription>Isi data nilai baru untuk santri</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Mata Pelajaran</Label>
                          <Select onValueChange={(value) => setNewGrade({ ...newGrade, subject_name: value })}>
                            <SelectTrigger>
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
                        <div>
                          <Label>Nilai</Label>
                          <Input type="number" value={newGrade.score} onChange={(e) => setNewGrade({ ...newGrade, score: parseInt(e.target.value) })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Semester</Label>
                          <Select onValueChange={(value) => setNewGrade({ ...newGrade, semester: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih semester" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ganjil">Ganjil</SelectItem>
                              <SelectItem value="Genap">Genap</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Tahun Akademik</Label>
                          <Input type="text" value={newGrade.academic_year} onChange={(e) => setNewGrade({ ...newGrade, academic_year: e.target.value })} placeholder="2024/2025" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                      <Button onClick={handleAddGrade} className="bg-blue-600 hover:bg-blue-700">Simpan</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-lg border border-blue-100 overflow-hidden">
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
                        <TableCell>{(grade as any).score ?? grade.score}</TableCell>
                        <TableCell>{grade.semester}</TableCell>
                        <TableCell>{grade.academic_year}</TableCell>
                        <TableCell className="space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(grade)}>
                            <Pencil className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleHistoryClick(grade)}>
                            <History className="w-4 h-4 mr-1" /> Riwayat
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(grade)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Hapus
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Edit Form */}
              {showEditForm && selectedGrade && (
                <div className="mt-6 p-4 border rounded-lg">
                  <h3 className="font-semibold mb-3">Edit Nilai</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Mata Pelajaran</Label>
                      <Select value={editForm.subject_name} onValueChange={(value) => setEditForm({ ...editForm, subject_name: value })}>
                        <SelectTrigger>
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
                    <div>
                      <Label>Nilai</Label>
                      <Input type="number" value={editForm.score} onChange={(e) => setEditForm({ ...editForm, score: e.target.value })} />
                    </div>
                    <div>
                      <Label>Semester</Label>
                      <Select value={editForm.semester} onValueChange={(value) => setEditForm({ ...editForm, semester: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ganjil">Ganjil</SelectItem>
                          <SelectItem value="Genap">Genap</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tahun Akademik</Label>
                      <Input type="text" value={editForm.academic_year} onChange={(e) => setEditForm({ ...editForm, academic_year: e.target.value })} />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" onClick={() => setShowEditForm(false)}>Batal</Button>
                    <Button onClick={handleEditGrade} className="bg-blue-600 hover:bg-blue-700">Simpan</Button>
                  </div>
                </div>
              )}

              {/* Delete Dialog */}
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Hapus Nilai</DialogTitle>
                    <DialogDescription>Anda yakin ingin menghapus nilai ini?</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Batal</Button>
                    <Button variant="destructive" onClick={handleDeleteGrade}>Hapus</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* History Dialog */}
              <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Riwayat Nilai</DialogTitle>
                  </DialogHeader>
                  <div className="rounded-lg border border-blue-100 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Nilai</TableHead>
                          <TableHead>Semester</TableHead>
                          <TableHead>Tahun Akademik</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gradeHistory.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{new Date(item.created_at || Date.now()).toLocaleString("id-ID")}</TableCell>
                            <TableCell>{item.score}</TableCell>
                            <TableCell>{item.semester}</TableCell>
                            <TableCell>{item.academic_year}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default StudentGradesPage;