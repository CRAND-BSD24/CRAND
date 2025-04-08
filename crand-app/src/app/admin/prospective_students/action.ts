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

  console.log("✅ MongoDB connected:", client !== undefined);

  const prospectiveCollection = db.collection("prospective_students");
  const studentsCollection = db.collection("students");
  const usersCollection = db.collection("users");

  try {
    const prospective = await prospectiveCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!prospective) {
      console.error("❌ Calon santri tidak ditemukan dengan ID:", id);
      return { success: false, message: "Data calon santri tidak ditemukan." };
    }

    console.log("📄 Data calon santri ditemukan:", prospective);

    // Validasi minimal
    if (!prospective.email || !prospective.academic_year || !prospective.birth_date) {
      console.error("❌ Data calon santri tidak lengkap:", prospective);
      return { success: false, message: "Data calon santri tidak lengkap." };
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(prospective.email)) {
      return { success: false, message: "Format email tidak valid." };
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await usersCollection.findOne({
      email: prospective.email,
    });

    if (existingUser) {
      console.error("❌ Email sudah terdaftar:", prospective.email);
      return {
        success: false,
        message: "Email sudah terdaftar sebagai pengguna.",
      };
    }

    const hashedPassword = await bcrypt.hash("student123!", 10);

    const userData = {
      profile_picture:
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
      name: prospective.name,
      email: prospective.email,
      password: hashedPassword,
      phone_number: prospective.phone_number,
      role: "student",
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log("📥 Data user yang akan dimasukkan:", userData);

    const userInsert = await usersCollection.insertOne(userData);
    if (!userInsert.acknowledged) {
      return { success: false, message: "Gagal menyimpan data user." };
    }

    console.log("✅ Hasil insert user:", userInsert);

    const birthDateStr = prospective.birth_date;

    const generateNisn = (birthDate: string, academicYear: string) => {
      if (!birthDate || !academicYear) return null;
      const datePart = birthDate.replace(/-/g, "");
      if (datePart.length < 6 || academicYear.length < 4) return null;
      return (
        datePart.substring(2, 4) +
        datePart.substring(4, 6) +
        academicYear[0] +
        academicYear[2] +
        academicYear[3]
      );
    };

    const nisn = generateNisn(birthDateStr, prospective.academic_year);

    if (!nisn) {
      return {
        success: false,
        message: "Format tanggal lahir atau tahun ajaran tidak valid untuk membuat NISN.",
      };
    }

    const studentData = {
      user_id: userInsert.insertedId,
      name: prospective.name,
      phone_number: prospective.phone_number,
      nisn,
      program: prospective.program || "",
      level: "1",
      academic_level: prospective.academic_level || "",
      gender: prospective.gender,
      address: prospective.address,
      birth_date: prospective.birth_date,
      birth_place: prospective.birth_place,
      parent_name: [prospective.father_name, prospective.mother_name]
        .filter(Boolean)
        .join(" / "),
      class: "",
      academic_year: prospective.academic_year,
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log("📥 Data student yang akan dimasukkan:", studentData);

    const studentInsert = await studentsCollection.insertOne(studentData);
    if (!studentInsert.acknowledged) {
      return { success: false, message: "Gagal menyimpan data santri." };
    }

    console.log("✅ Hasil insert student:", studentInsert);

    // Hapus dari calon santri
    await prospectiveCollection.deleteOne({ _id: new ObjectId(id) });

    console.log("🗑️ Calon santri berhasil dihapus dari collection prospective_students.");

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
      return { success: false, message: "Data tidak ditemukan atau sudah dihapus." };
    }
  } catch (error) {
    console.error("Error rejecting student:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menolak santri.",
    };
  }
};

