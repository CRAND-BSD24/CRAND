"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export interface StudentGrade {
  subject_name: string;
  score: number;
  semester: string;
  academic_year: string;
}

export interface Subject {
  _id: string;
  name: string;
}

export async function getSubjects(): Promise<Subject[]> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    const subjects = await db.collection("subjects").find({}).toArray();

    return subjects.map((subject) => ({
      _id: subject._id.toString(),
      name: subject.name,
    }));
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw new Error("Gagal mengambil data mata pelajaran");
  }
}

export async function getStudentGrades(
  studentId: string
): Promise<StudentGrade[]> {
  try {
    console.log("Mengambil data nilai untuk studentId:", studentId);

    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    // Menggunakan agregasi untuk mendapatkan data nilai dengan nama mata pelajaran
    const grades = await db
      .collection("grades")
      .aggregate([
        {
          $match: {
            student_id: new ObjectId(studentId),
          },
        },
        {
          $lookup: {
            from: "subjects",
            localField: "subject_id",
            foreignField: "_id",
            as: "subject",
          },
        },
        {
          $unwind: "$subject",
        },
        {
          $project: {
            subject_name: "$subject.name",
            score: 1,
            semester: 1,
            academic_year: 1,
          },
        },
      ])
      .toArray();

    console.log("Data nilai yang ditemukan:", grades);

    return grades.map((grade) => ({
      subject_name: grade.subject_name,
      score: grade.score,
      semester: grade.semester,
      academic_year: grade.academic_year,
    }));
  } catch (error) {
    console.error("Error fetching student grades:", error);
    throw new Error("Gagal mengambil data nilai siswa");
  }
}

export async function updateStudentGrade(
  studentId: string,
  subjectName: string,
  score: number,
  semester: string,
  academicYear: string
): Promise<void> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    // Cari subjectId berdasarkan nama mata pelajaran
    const subject = await db.collection("subjects").findOne({
      name: subjectName,
    });

    if (!subject) {
      throw new Error("Mata pelajaran tidak ditemukan");
    }

    await db.collection("grades").updateOne(
      {
        student_id: new ObjectId(studentId),
        subject_id: subject._id,
      },
      {
        $set: {
          score,
          semester,
          academic_year: academicYear,
          updated_at: new Date(),
          created_at: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error updating student grade:", error);
    throw new Error("Gagal memperbarui nilai siswa");
  }
}

export async function deleteStudentGrade(
  studentId: string,
  subjectName: string
): Promise<void> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    // Cari subjectId berdasarkan nama mata pelajaran
    const subject = await db.collection("subjects").findOne({
      name: subjectName,
    });

    if (!subject) {
      throw new Error("Mata pelajaran tidak ditemukan");
    }

    // Hapus data nilai
    const result = await db.collection("grades").deleteOne({
      student_id: new ObjectId(studentId),
      subject_id: subject._id,
    });

    if (result.deletedCount === 0) {
      throw new Error("Data nilai tidak ditemukan");
    }
  } catch (error) {
    console.error("Error deleting student grade:", error);
    throw new Error("Gagal menghapus nilai siswa");
  }
}
