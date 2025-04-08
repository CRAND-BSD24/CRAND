'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

interface StudentUpdate {
  name: string;
  class_id: string | null;
  academic_level: string;
  gender: string;
  father_name: string;
  mother_name: string;
  academic_year: string;
  birth_date_place: string;
  address: string;
  email: string;
  phone_number: string;
  graduation_status: string;
  payment_status: string;
  VA_SPP: string;
  ekskul: string;
  level: string;
  nisn: string;
  program: string;
  halaqah_id: string | null;
  profile_picture: string;
}

export const getStudentById = async (id: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const student = await db.collection("students").findOne({ _id: new ObjectId(id) });
    console.log("Student data:", student);

    if (!student) return null;

    // Get class data
    const classData = student.class_id 
      ? await db.collection("classes").findOne({ _id: new ObjectId(student.class_id) })
      : null;
    console.log("Class data:", classData);

    // Get user data for phone number and email
    const userData = await db.collection("users").findOne({ student_id: new ObjectId(id) });
    console.log("User data:", userData);

    // Get halaqah data
    const halaqahData = student.halaqah_id
      ? await db.collection("halaqah").findOne({ _id: new ObjectId(student.halaqah_id) })
      : null;
    console.log("Halaqah data:", halaqahData);

    const result = {
      _id: student._id.toString(),
      name: student.name || "-",
      class: classData ? classData.class_name : "-",
      class_id: student.class_id?.toString() || null,
      academic_level: student.academic_level || "-",
      gender: student.gender || "-",
      father_name: student.father_name || "-",
      mother_name: student.mother_name || "-",
      academic_year: student.academic_year || "-",
      birth_date_place: student.birth_date_place || "-",
      address: student.address || "-",
      email: userData?.email || "-",
      phone_number: userData?.phone_number || "-",
      graduation_status: student.graduation_status || "Aktif",
      payment_status: student.payment_status || "-",
      VA_SPP: student.VA_SPP || "-",
      ekskul: student.ekskul || "-",
      level: student.level || "-",
      nisn: student.nisn || "-",
      program: student.program || "-",
      halaqah: halaqahData ? halaqahData.name : "-",
      halaqah_id: student.halaqah_id?.toString() || null,
      profile_picture: student.profile_picture || "/default-profile.png",
      created_at: student.created_at || new Date(),
      updated_at: student.updated_at || new Date(),
    };

    console.log("Final result:", result);
    return JSON.stringify(result);
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    return null;
  }
};

interface UserUpdate {
  $set: {
    phone_number?: string;
    email?: string;
    updated_at: Date;
  };
}

export const updateStudentById = async (id: string, updatedData: StudentUpdate) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    console.log("Updating student with data:", updatedData);

    // Update student data
    const studentResult = await db.collection("students").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: updatedData.name,
          class_id: updatedData.class_id ? new ObjectId(updatedData.class_id) : null,
          academic_level: updatedData.academic_level,
          gender: updatedData.gender,
          father_name: updatedData.father_name,
          mother_name: updatedData.mother_name,
          academic_year: updatedData.academic_year,
          birth_date_place: updatedData.birth_date_place,
          address: updatedData.address,
          graduation_status: updatedData.graduation_status,
          payment_status: updatedData.payment_status,
          VA_SPP: updatedData.VA_SPP,
          ekskul: updatedData.ekskul,
          level: updatedData.level,
          nisn: updatedData.nisn,
          program: updatedData.program,
          halaqah_id: updatedData.halaqah_id ? new ObjectId(updatedData.halaqah_id) : null,
          profile_picture: updatedData.profile_picture,
          updated_at: new Date()
        }
      }
    );

    console.log("Student update result:", studentResult);

    // Update user data (phone number and email)
    if (updatedData.phone_number || updatedData.email) {
      console.log("Updating user data:", { phone: updatedData.phone_number, email: updatedData.email });
      
      const userUpdate: UserUpdate = {
        $set: {
          updated_at: new Date()
        }
      };

      if (updatedData.phone_number) {
        userUpdate.$set.phone_number = updatedData.phone_number;
      }
      if (updatedData.email) {
        userUpdate.$set.email = updatedData.email;
      }

      const userResult = await db.collection("users").updateOne(
        { student_id: new ObjectId(id) },
        userUpdate,
        { upsert: true }
      );
      console.log("User update result:", userResult);
    }

    return studentResult.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating student:", error);
    return false;
  }
};

export const deleteStudentById = async (id: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const result = await db.collection("students").deleteOne({
      _id: new ObjectId(id),
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting student:", error);
    return false;
  }
};