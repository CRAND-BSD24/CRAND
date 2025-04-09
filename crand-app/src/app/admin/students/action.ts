"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

interface StudentData {
  name: string;
  class_id: string;
  academic_level: string;
  gender: string;
  parent_name: string;
  birth_place_date: string;
  address: string;
  phone_number: string;
}

interface FilterOptions {
  class_id?: string;
  academic_level?: string;
}

interface NewStudentData {
  name: string;
  nisn: string;
  email: string;
  gender: string;
  phone_number: string;
  father_name: string;
  academic_year: string;
  program: string;
  ekskul: string;
  class_id: string;
  VA_SPP: string;
  birth_place_date: string;
  address: string;
  mother_name: string;
  academic_level: string;
  level: string;
  halaqah_id: string;
  graduation_status: string;
}

/**
 * GET all students with optional filter & sorting
 */
export const getAllStudents = async (
  filters?: FilterOptions,
  sortField: string = "created_at",
  sortOrder: "asc" | "desc" = "desc"
) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    // Define a more specific type for the match stage, allowing ObjectId or string
    const matchStage: { class_id?: ObjectId; academic_level?: string } = {};
    if (filters?.class_id) matchStage.class_id = new ObjectId(filters.class_id);
    if (filters?.academic_level) matchStage.academic_level = filters.academic_level;

    const sort: { [key: string]: 1 | -1 } = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const students = await db.collection("students").aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "classes",
          localField: "class_id",
          foreignField: "_id",
          as: "class_info"
        }
      },
      {
        $addFields: {
          class_name: { $arrayElemAt: ["$class_info.class_name", 0] }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          nisn: 1,
          class_id: 1,
          class_name: 1,
          academic_level: 1,
          gender: 1,
          parent_name: 1,
          birth_date: 1,
          birth_place: 1,
          address: 1,
          phone_number: 1,
          graduation_status: 1,
          payment_status: 1,
          created_at: 1,
          updated_at: 1
        }
      },
      { $sort: sort }
    ]).toArray();

    return JSON.stringify(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return JSON.stringify([]);
  }
};

/**
 * CREATE student
 */
export const createStudent = async (formData: StudentData) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    if (
      !formData.name ||
      !formData.class_id ||
      !formData.academic_level ||
      !formData.gender ||
      !formData.parent_name
    ) {
      console.error("Missing required fields");
      return false;
    }

    const validAcademicLevels = ["Ibtidaiyah", "Tsanawiyah", "Aliyah", "SMA", "Wustho"];
    if (!validAcademicLevels.includes(formData.academic_level)) {
      console.error(`Invalid academic level: ${formData.academic_level}`);
      return false;
    }

    if (!["Laki-laki", "Perempuan"].includes(formData.gender)) {
      console.error(`Invalid gender: ${formData.gender}`);
      return false;
    }

    const studentDoc = {
      name: formData.name,
      class_id: new ObjectId(formData.class_id),
      academic_level: formData.academic_level,
      gender: formData.gender,
      parent_name: formData.parent_name,
      birth_place_date: formData.birth_place_date || "",
      address: formData.address || "",
      phone_number: formData.phone_number || "",
      graduation_status: "Aktif",
      payment_status: "Belum Lunas",
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection("students").insertOne(studentDoc);

    if (!result.insertedId) {
      console.error("Failed to insert student");
      return false;
    }

    console.log(`Created student with ID: ${result.insertedId}`);
    return true;
  } catch (error) {
    console.error("Error creating student:", error);
    return false;
  }
};

/**
 * BULK PROMOTE students from one class to the next by class_id
 */
export const promoteStudentsByClassId = async (classId: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const oldClass = await db.collection("classes").findOne({ _id: new ObjectId(classId) });

    if (!oldClass) {
      console.error("Class not found");
      return false;
    }

    const classRegex = /^(\d+)([A-Z]+)$/;
    const match = oldClass.class_name.match(classRegex);

    if (!match) {
      console.error(`Invalid class name format: ${oldClass.class_name}`);
      return false;
    }

    const currentLevel = parseInt(match[1]);
    const suffix = match[2];

    if (currentLevel >= 12) {
      console.log(`Class ${oldClass.class_name} is already the highest level`);
      return false;
    }

    const nextClassName = `${currentLevel + 1}${suffix}`;
    const nextClass = await db.collection("classes").findOne({ class_name: nextClassName });

    if (!nextClass) {
      console.error(`Next class not found: ${nextClassName}`);
      return false;
    }

    const result = await db.collection("students").updateMany(
      { class_id: oldClass._id },
      {
        $set: {
          class_id: nextClass._id,
          updated_at: new Date()
        }
      }
    );

    console.log(`Promoted ${result.modifiedCount} students from ${oldClass.class_name} to ${nextClass.class_name}`);
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error promoting students by class:", error);
    return false;
  }
};

export const createNewStudent = async (data: NewStudentData) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    // Validate required fields
    if (!data.nisn || !data.email || !data.gender || !data.class_id || !data.academic_level || !data.name) {
      throw new Error("Mohon lengkapi semua field yang wajib diisi");
    }

    // Validate academic level
    const validAcademicLevels = ["Ula", "Wustho", "Ulya", "SMP Formal", "Aliyah Agama", "Aliyah IPA"];
    if (!validAcademicLevels.includes(data.academic_level)) {
      throw new Error("Tingkat akademik tidak valid");
    }

    // Validate program
    const validPrograms = ["Reguler", "Shorhul Qurro"];
    if (!validPrograms.includes(data.program)) {
      throw new Error("Program tidak valid");
    }

    // Validate ekskul
    const validEkskul = ["Memanah", "Berkuda", "Renang", "Media"];
    if (!validEkskul.includes(data.ekskul)) {
      throw new Error("Ekskul tidak valid");
    }

    // Create user first
    const userResult = await db.collection("users").insertOne({
      name: data.name,
      email: data.email,
      phone_number: data.phone_number,
      role: "student",
      created_at: new Date(),
      updated_at: new Date()
    });

    // Create student document
    const studentDoc = {
      name: data.name,
      nisn: data.nisn,
      user_id: userResult.insertedId,
      gender: data.gender,
      father_name: data.father_name,
      mother_name: data.mother_name,
      academic_year: data.academic_year,
      program: data.program,
      ekskul: data.ekskul,
      class_id: new ObjectId(data.class_id),
      VA_SPP: data.VA_SPP,
      birth_place_date: data.birth_place_date,
      address: data.address,
      academic_level: data.academic_level,
      level: data.level,
      halaqah_id: new ObjectId(data.halaqah_id),
      graduation_status: data.graduation_status,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection("students").insertOne(studentDoc);

    if (!result.insertedId) {
      throw new Error("Gagal menyimpan data santri");
    }

    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
};
