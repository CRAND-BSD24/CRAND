"use server";

import { getMongoClientInstance } from "@/lib/mongodb";
import { Binary, ObjectId } from "mongodb";
import { isValidAttendanceTime } from "@/lib/shift-utils";

export interface AttendanceRecord {
  _id?: ObjectId | string;
  name: string;
  photo: string;
  timestamp: string;
  type: "admin" | "teacher";
  faceDescriptor: number[];
}

interface AttendanceRecordInsert {
  name: string;
  photo: Binary;
  timestamp: string;
  type: string;
  faceDescriptor: number[];
}

const checkAttendanceTime = (): { isValid: boolean; message: string } => {
  return isValidAttendanceTime(new Date(), "admin");
};

const isWithinRadius = (
  userLat: number,
  userLng: number,
  locations: Array<{ lat: number; lng: number }>,
  radius: number
): boolean => {
  const R = 6371e3; // Earth's radius in meters

  for (const location of locations) {
    const φ1 = (userLat * Math.PI) / 180;
    const φ2 = (location.lat * Math.PI) / 180;
    const Δφ = ((location.lat - userLat) * Math.PI) / 180;
    const Δλ = ((location.lng - userLng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance <= radius) {
      return true;
    }
  }
  return false;
};

export async function handleAbsensi(
  photo: string,
  faceDescriptor: number[],
  type: string,
  name?: string,
  latitude?: number,
  longitude?: number
) {
  try {
    // Cek waktu absensi
    const timeCheck = checkAttendanceTime();
    if (!timeCheck.isValid) {
      return {
        success: false,
        message: timeCheck.message,
      };
    }
    const ENABLE_LOCATION_CHECK = false;
    if (ENABLE_LOCATION_CHECK && latitude !== undefined && longitude !== undefined) {
      const allowedLocations = [
        { lat: -5.9943049319879425, lng: 106.04812321979192 },
        { lat: -5.979029363145886, lng: 106.0590577982583 },
        { lat: -5.979356246025161, lng: 106.05914613343309 },
        { lat: -5.994659669233751, lng: 106.04809359755676 }
      ];
      const radius = 1000; // dalam meter

      const isWithin = isWithinRadius(
        latitude,
        longitude,
        allowedLocations,
        radius
      );

      if (!isWithin) {
        return {
          success: false,
          message: "Absensi hanya dapat dilakukan di lokasi yang ditentukan.",
        };
      }
    }

    const client = await getMongoClientInstance();
    const db = client.db("crand");
    const collection = db.collection("attendance");

    // Konversi base64 ke Buffer
    const buffer = Buffer.from(photo, "base64");
    const binaryPhoto = new Binary(buffer);

    const timestamp = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    });

    const record: AttendanceRecordInsert = {
      name: name || "",
      photo: binaryPhoto,
      timestamp,
      type,
      faceDescriptor,
    };

    await collection.insertOne(record);

    return {
      success: true,
      message: "Absensi berhasil disimpan",
      timestamp,
    };
  } catch (error) {
    console.error("Error in handleAbsensi:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menyimpan absensi",
    };
  }
}

export async function getAttendanceRecords() {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("crand");
    const collection = db.collection("attendance");

    const records = await collection
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    return records;
  } catch (error) {
    console.error("Error in getAttendanceRecords:", error);
    throw error;
  }
}

export async function getAdminAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    const collection = db.collection("admin_attendance");

    const records = await collection
      .aggregate([
        { $sort: { created_at: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "admin_id",
            foreignField: "_id",
            as: "admin",
          },
        },
        { $unwind: { path: "$admin", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            name: { $ifNull: ["$admin.name", "Admin"] },
            photo: 1,
            created_at: 1,
            face_descriptor: 1,
          },
        },
      ])
      .toArray();

    return records.map((record: any) => ({
      _id: record._id.toString(),
      name: record.name,
      photo:
        typeof record.photo === "string"
          ? record.photo
          : record.photo?.buffer
          ? Buffer.from(record.photo.buffer).toString("base64")
          : "",
      timestamp: new Date(record.created_at).toLocaleString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      type: "admin",
      faceDescriptor: record.face_descriptor,
    }));
  } catch (error) {
    console.error("Error in getAdminAttendanceRecords:", error);
    throw error;
  }
}

export async function getTeacherAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    const collection = db.collection("attendance");

    const records = await collection
      .find({ type: "teacher" })
      .sort({ created_at: -1 })
      .toArray();

    return records.map(record => ({
      _id: record._id.toString(),
      name: record.name,
      photo: record.photo,
      timestamp: record.created_at.toLocaleString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }),
      type: record.type,
      faceDescriptor: record.face_descriptor
    }));
  } catch (error) {
    console.error("Error in getTeacherAttendanceRecords:", error);
    throw error;
  }
}
