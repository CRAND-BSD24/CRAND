'use server';

import { getMongoClientInstance } from "@/db/config/connection";

export interface AttendanceRecord {
  _id: string;
  name: string;
  timestamp: Date;
  photo: Buffer;
}

export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db('pesantren_db');
    const attendanceCollection = db.collection('attendance');

    const records = await attendanceCollection
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    // Convert ObjectId to string and Binary photo to base64
    return records.map(record => ({
      _id: record._id.toString(),
      name: record.name,
      timestamp: record.timestamp,
      photo: record.photo.buffer.toString('base64')
    })) as AttendanceRecord[];
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }
}
