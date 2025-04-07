'use server';

import { getMongoClientInstance } from "@/db/config/connection";

export const getAllStudents = async () => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const students = await db.collection("students").find({}).toArray();

  const data = JSON.stringify(students);
  return data;
};

export const getAllTeachers = async () => {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const teachers = await db.collection("teachers").find({}).toArray();

  const data = JSON.stringify(teachers);
  return data;
};

// Debug function to check for a specific teacher
export const findTeacherByName = async (name: string) => {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    
    // Try different databases in case "pesantren_db" is not correct
    const dbNames = await client.db().admin().listDatabases();
    console.log("Available databases:", dbNames.databases.map(db => db.name));
    
    const teachers = await db.collection("teachers").find({}).toArray();
    console.log("All teachers:", JSON.stringify(teachers, null, 2));
    
    // Try various search methods
    const exactMatch = teachers.find(t => t.name === name);
    const caseInsensitiveMatch = teachers.find(t => t.name && t.name.toLowerCase() === name.toLowerCase());
    const partialMatch = teachers.find(t => t.name && t.name.toLowerCase().includes(name.toLowerCase()));
    
    return JSON.stringify({
      teacherCount: teachers.length,
      allTeacherNames: teachers.map(t => t.name),
      exactMatch,
      caseInsensitiveMatch,
      partialMatch
    });
  } catch (error: any) {
    console.error("Error finding teacher:", error);
    return JSON.stringify({ error: error.message });
  }
};