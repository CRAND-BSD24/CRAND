"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

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
    if (filters?.academic_level)
      matchStage.academic_level = filters.academic_level;

    const sort: { [key: string]: 1 | -1 } = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const students = await db
      .collection("students")
      .aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "classes",
            localField: "class_id",
            foreignField: "_id",
            as: "class_info",
          },
        },
        {
          $addFields: {
            class_name: { $arrayElemAt: ["$class_info.class_name", 0] },
          },
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
            updated_at: 1,
          },
        },
        { $sort: sort },
      ])
      .toArray();

    return JSON.stringify(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return JSON.stringify([]);
  }
};

/**
 * CREATE student
 */
// export const createStudent = async (formData: StudentData) => {
//   const client = await getMongoClientInstance();
//   const db = client.db("pesantren_db");

//   try {
//     if (
//       !formData.name ||
//       !formData.class_id ||
//       !formData.academic_level ||
//       !formData.gender ||
//       !formData.parent_name
//     ) {
//       console.error("Missing required fields");
//       return false;
//     }

//     const validAcademicLevels = ["Ibtidaiyah", "Tsanawiyah", "Aliyah", "SMA", "Wustho"];
//     if (!validAcademicLevels.includes(formData.academic_level)) {
//       console.error(`Invalid academic level: ${formData.academic_level}`);
//       return false;
//     }

//     if (!["Laki-laki", "Perempuan"].includes(formData.gender)) {
//       console.error(`Invalid gender: ${formData.gender}`);
//       return false;
//     }

//     // Hash password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash("student123", saltRounds);

//     // Create user first
//     const userDoc = {
//       name: formData.name,
//       email: `${formData.name.toLowerCase().replace(/\s+/g, '.')}@pesantren.com`,
//       password: hashedPassword,
//       role: "student",
//       phone_number: formData.phone_number || "",
//       profile_picture: "data:image/png;base64,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",
//       created_at: new Date(),
//       updated_at: new Date()
//     };

//     const userResult = await db.collection("users").insertOne(userDoc);

//     if (!userResult.insertedId) {
//       console.error("Failed to create user");
//       return false;
//     }

//     const studentDoc = {
//       name: formData.name,
//       class_id: new ObjectId(formData.class_id),
//       academic_level: formData.academic_level,
//       gender: formData.gender,
//       parent_name: formData.parent_name,
//       birth_place_date: formData.birth_place_date || "",
//       address: formData.address || "",
//       phone_number: formData.phone_number || "",
//       graduation_status: "Aktif",
//       payment_status: "Belum Lunas",
//       user_id: userResult.insertedId,
//       created_at: new Date(),
//       updated_at: new Date()
//     };

//     const result = await db.collection("students").insertOne(studentDoc);

//     if (!result.insertedId) {
//       console.error("Failed to insert student");
//       return false;
//     }

//     console.log(`Created student with ID: ${result.insertedId}`);
//     return true;
//   } catch (error) {
//     console.error("Error creating student:", error);
//     return false;
//   }
// };

/**
 * BULK PROMOTE students from one class to the next by class_id
 */
export const promoteStudentsByClassId = async (className: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const oldClass = await db
      .collection("classes")
      .findOne({ class_name: className });

    if (!oldClass) {
      console.error("Class not found");
      return false;
    }

    // Extract numeric part from class name
    const numericMatch = className.match(/\d+/);
    if (!numericMatch) {
      console.error(`No numeric part found in class name: ${className}`);
      return false;
    }

    const currentLevel = parseInt(numericMatch[0]);
    const suffix = className.replace(numericMatch[0], ""); // Get the non-numeric part

    if (currentLevel >= 12) {
      console.log(`Class ${className} is already the highest level`);
      return false;
    }

    const nextClassName = `${currentLevel + 1}${suffix}`;
    const nextClass = await db
      .collection("classes")
      .findOne({ class_name: nextClassName });

    if (!nextClass) {
      console.error(`Next class not found: ${nextClassName}`);
      return false;
    }

    const result = await db.collection("students").updateMany(
      { class_id: oldClass._id },
      {
        $set: {
          class_id: nextClass._id,
          updated_at: new Date(),
        },
      }
    );

    console.log(
      `Promoted ${result.modifiedCount} students from ${className} to ${nextClassName}`
    );
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
    if (
      !data.nisn ||
      !data.email ||
      !data.gender ||
      !data.class_id ||
      !data.academic_level ||
      !data.name
    ) {
      throw new Error("Mohon lengkapi semua field yang wajib diisi");
    }

    // Validate academic level
    const validAcademicLevels = [
      "Ula",
      "Wustho",
      "Ulya",
      "SMP Formal",
      "Aliyah Agama",
      "Aliyah IPA",
    ];
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

    // Hash the default password
    const hashedPassword = await bcrypt.hash("student123", 10);

    // Create user first
    const userResult = await db.collection("users").insertOne({
      name: data.name,
      email: data.email,
      phone_number: data.phone_number,
      role: "student",
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
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
      updated_at: new Date(),
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

export const deleteStudent = async (id: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const result = await db.collection("students").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      console.error("No student found with the given ID");
      return false;
    }

    console.log(`Deleted student with ID: ${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting student:", error);
    return false;
  }
};
