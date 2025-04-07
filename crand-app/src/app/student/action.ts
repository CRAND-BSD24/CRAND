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