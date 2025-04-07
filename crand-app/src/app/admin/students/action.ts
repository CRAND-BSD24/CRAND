"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { AnyBulkWriteOperation, Document } from "mongodb";

interface StudentData {
  name: string;
  nisn: string;
  program: string;
  level: string;
  academic_level: string;
  gender: string;
  address: string;
  birth_place: string;
  birth_date: string;
  eskul: string;
  VA_SPP: string;
  class: string;
  batch_year: number;
  parent_name: string;
}

export const getAllStudents = async () => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const students = await db.collection("students").find().toArray();
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
      !formData.class ||
      !formData.academic_level ||
      !formData.gender ||
      !formData.parent_name ||
      !formData.batch_year
    ) {
      console.error("Missing required fields");
      return false;
    }

    const classRegex = /^\d{1,2}[A-Z]$/;
    if (!classRegex.test(formData.class)) {
      console.error(`Invalid class format: ${formData.class}`);
      return false;
    }

    const validAcademicLevels = ["Ibtidaiyah", "Tsanawiyah", "Aliyah"];
    if (!validAcademicLevels.includes(formData.academic_level)) {
      console.error(`Invalid academic level: ${formData.academic_level}`);
      return false;
    }

    if (!["Laki-laki", "Perempuan"].includes(formData.gender)) {
      console.error(`Invalid gender: ${formData.gender}`);
      return false;
    }

    if (isNaN(Number(formData.batch_year))) {
      console.error(`Invalid enrollment year: ${formData.batch_year}`);
      return false;
    }

    const studentDoc = {
      ...formData,
      batch_year: Number(formData.batch_year),
      birth_date: formData.birth_date ? new Date(formData.birth_date) : null,
      created_at: new Date(),
      updated_at: new Date(),
      status: "active",
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