"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export interface AttendanceData {
  student_id: string;
  date: Date;
  status: "Present" | "Sick" | "Permission" | "Absent";
}

export async function createAttendance(data: AttendanceData) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  try {
    const result = await db.collection("class_attendance").insertOne({
      student_id: new ObjectId(data.student_id),
      date: data.date,
      status: data.status,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    console.error("Error creating attendance:", error);
    throw error;
  }
}

export async function getAttendanceStatus(studentIds: string[]) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const attendanceRecords = await db
      .collection("class_attendance")
      .find({
        student_id: { $in: studentIds.map((id) => new ObjectId(id)) },
        date: { $gte: today },
      })
      .toArray();

    const statusMap: Record<string, string> = {};
    attendanceRecords.forEach((record) => {
      statusMap[record.student_id.toString()] = record.status;
    });

    return statusMap;
  } catch (error) {
    console.error("Error fetching attendance status:", error);
    throw error;
  }
}
