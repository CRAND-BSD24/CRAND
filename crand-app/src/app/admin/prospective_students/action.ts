"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export const getAllStudents = async () => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const students = await db
      .collection("prospective_students")
      .find()
      .toArray();
    return JSON.stringify(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return JSON.stringify([]);
  }
};

export const createStudent = async (formData: any) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const result = await db.collection("prospective_students").insertOne({
      ...formData,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return result.insertedId ? true : false;
  } catch (error) {
    console.error("Error creating student:", error);
    return false;
  }
};

export const acceptStudent = async (id: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  const prospectiveCollection = db.collection("prospective_students");
  const studentsCollection = db.collection("students");
  const usersCollection = db.collection("users");
  const classCollection = db.collection("classes");

  try {
    const prospective = await prospectiveCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!prospective) {
      return { success: false, message: "Calon santri tidak ditemukan." };
    }

    // Validasi data minimal
    const requiredFields = ["email", "academic_year", "birth_place_date"];
    for (const field of requiredFields) {
      if (!prospective[field]) {
        return {
          success: false,
          message: `Field ${field} wajib diisi.`,
        };
      }
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(prospective.email)) {
      return { success: false, message: "Format email tidak valid." };
    }

    // Cek apakah email sudah digunakan
    const existingUser = await usersCollection.findOne({
      email: prospective.email,
    });

    if (existingUser) {
      return {
        success: false,
        message: "Email sudah terdaftar sebagai pengguna.",
      };
    }

    const hashedPassword = await bcrypt.hash("student123!", 10);

    const userData = {
      profile_picture:
        "data:image/png;base64,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",
      name: prospective.name,
      email: prospective.email,
      password: hashedPassword,
      phone_number: prospective.phone_number,
      role: "student",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const userInsert = await usersCollection.insertOne(userData);

    if (!userInsert.acknowledged) {
      return { success: false, message: "Gagal menyimpan data user." };
    }

    // Generate NISN dari 0000 + tahun ajaran + students collection length
    const year = prospective.academic_year.split("/")[0];
    const studentsCount = await studentsCollection.countDocuments({
      academic_year: prospective.academic_year,
    });
    const nisn = `0000${year}${studentsCount + 1}`.slice(-10); 

    if (!nisn) {
      return {
        success: false,
        message: "Gagal membuat NISN dari tanggal lahir/tahun ajaran.",
      };
    }

    // Ambil default kelas (misalnya kelas 7)
    const classData = await classCollection.findOne({ class_name: "7" });

    const studentData = {
      name: prospective.name,
      email: prospective.email,
      phone_number: prospective.phone_number,
      nisn,
      program: prospective.program || "",
      level: "1",
      academic_level: prospective.academic_level || "",
      gender: prospective.gender,
      address: prospective.address,
      eskul: "",
      VA_SPP: "",
      graduation_status: "Belum Lulus",
      birth_place_date: prospective.birth_place_date,
      academic_year: prospective.academic_year,
      user_id: userInsert.insertedId, // ✅ Hubungkan ke user
      class_id: classData ? classData._id : null,
      mother_name: prospective.mother_name,
      father_name: prospective.father_name,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const studentInsert = await studentsCollection.insertOne(studentData);

    if (!studentInsert.acknowledged) {
      return { success: false, message: "Gagal menyimpan data santri." };
    }
    await prospectiveCollection.deleteOne({ _id: new ObjectId(id) });


    return { success: true, studentId: studentInsert.insertedId };
  } catch (error) {
    console.error("🔥 Error accepting student:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menerima santri.",
    };
  }
};

export const rejectStudent = async (id: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const result = await db
      .collection("prospective_students")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return { success: true };
    } else {
      return {
        success: false,
        message: "Data tidak ditemukan atau sudah dihapus.",
      };
    }
  } catch (error) {
    console.error("Error rejecting student:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menolak santri.",
    };
  }
};
