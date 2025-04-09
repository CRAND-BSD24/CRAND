"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { AnyBulkWriteOperation, Document, ObjectId } from "mongodb";

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
    const matchStage: any = {};
    if (filters?.class_id) matchStage.class_id = new ObjectId(filters.class_id);
    if (filters?.academic_level) matchStage.academic_level = filters.academic_level;

    const sort: any = {};
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
