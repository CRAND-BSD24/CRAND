"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { AnyBulkWriteOperation, Document, ObjectId } from "mongodb";

interface StudentData {
  name: string;
  class_id: string;
  academic_level: string;
  gender: string;
  parent_name: string;
  birth_date: string;
  birth_place: string;
  address: string;
  phone_number: string;
}

export const getAllStudents = async () => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const students = await db.collection("students").aggregate([
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
      }
    ]).toArray();

    return JSON.stringify(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return JSON.stringify([]);
  }
};

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
      birth_date: formData.birth_date ? new Date(formData.birth_date) : null,
      birth_place: formData.birth_place || "",
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

export const promoteStudentsByClass = async (className: string) => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const classRegex = /^(\d+)([A-Z]+)$/;
    if (!classRegex.test(className)) {
      console.error(`Invalid class name format: ${className}`);
      return false;
    }

    const students = await db
      .collection("students")
      .find({ class: className })
      .project({ _id: 1, class: 1 })
      .toArray();

    if (students.length === 0) {
      console.log(`No students found in class ${className}`);
      return false;
    }

    const bulkOps: AnyBulkWriteOperation<Document>[] = [];
    const currentDate = new Date();

    for (const student of students) {
      const match = student.class.match(classRegex);
      if (!match) continue;

      const currentLevel = parseInt(match[1]);
      const classSuffix = match[2];

      if (currentLevel >= 12) {
        console.log(`Student ${student._id} is already in the highest class (${student.class})`);
        continue;
      }

      const nextClass = `${currentLevel + 1}${classSuffix}`;

      bulkOps.push({
        updateOne: {
          filter: { _id: student._id },
          update: {
            $set: {
              class: nextClass,
              updated_at: currentDate,
            },
          },
        },
      });
    }

    if (bulkOps.length === 0) {
      console.log(`No valid students to promote in class ${className}`);
      return false;
    }

    const result = await db.collection("students").bulkWrite(bulkOps);

    console.log(`Promoted ${result.modifiedCount} students from ${className}`);
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error promoting students:", error);
    return false;
  }
};