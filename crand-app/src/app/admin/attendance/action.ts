"use server";

import { getMongoClientInstance } from "@/lib/mongodb";
import { Binary, ObjectId } from "mongodb";
import { isValidAttendanceTime } from "@/lib/shift-utils";

export interface AttendanceRecord {
  _id?: ObjectId | string;
  name: string;
  photo?: string;
  timestamp: string;
  type: "admin" | "teacher" | "staff" | "manager" | "educator" | "kepengasuhan" | string;
  faceDescriptor?: number[];
  is_late?: boolean;
  late_minutes?: number;
  date?: string;
  status?: string;
}

export interface TeacherRoleInfo {
  name: string;
  role: string;
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
            created_at: 1,
            face_descriptor: 1,
            is_late: 1,
            late_minutes: 1,
          },
        },
      ])
      .toArray();

    return records.map((record: any) => ({
      _id: record._id.toString(),
      name: record.name,
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
      is_late: record.is_late ?? false,
      late_minutes: record.late_minutes ?? 0,
      date: new Date(record.created_at).toISOString(),
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
      faceDescriptor: record.face_descriptor,
      is_late: record.is_late ?? false,
      late_minutes: record.late_minutes ?? 0,
      date: (record.date instanceof Date ? record.date : new Date(record.date)).toISOString(),
    }));
  } catch (error) {
    console.error("Error in getTeacherAttendanceRecords:", error);
    throw error;
  }
}

export async function getAttendanceRecordsByRole(role: string): Promise<AttendanceRecord[]> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    if (role === 'admin') {
      return getAdminAttendanceRecords();
    }

    if (role === 'staff') {
      const collection = db.collection("staff_attendance");
      const records = await collection.aggregate([
        { $sort: { created_at: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "staff_id",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
           $project: {
              _id: 1,
              name: { $ifNull: ["$user.name", "Staff"] },
              created_at: 1,
              face_descriptor: 1,
              is_late: 1,
              late_minutes: 1,
              date: 1
           }
        }
      ]).toArray();
      
      return records.map((record: any) => ({
        _id: record._id.toString(),
        name: record.name,
        timestamp: new Date(record.created_at).toLocaleString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }),
        type: "staff",
        faceDescriptor: record.face_descriptor,
        is_late: record.is_late ?? false,
        late_minutes: record.late_minutes ?? 0,
        date: record.date ? (record.date instanceof Date ? record.date.toISOString() : new Date(record.date).toISOString()) : new Date(record.created_at).toISOString(),
      }));
    }

    if (role === 'manager') {
      const collection = db.collection("manager_attendance");
      const records = await collection.aggregate([
        { $sort: { created_at: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "manager_id",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
           $project: {
              _id: 1,
              name: { $ifNull: ["$user.name", "Manager"] },
              created_at: 1,
              face_descriptor: 1,
              is_late: 1,
              late_minutes: 1,
              date: 1
           }
        }
      ]).toArray();
      
      return records.map((record: any) => ({
        _id: record._id.toString(),
        name: record.name,
        timestamp: new Date(record.created_at).toLocaleString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }),
        type: "manager", // Using 'manager' as type for consistency with role
        faceDescriptor: record.face_descriptor,
        is_late: record.is_late ?? false,
        late_minutes: record.late_minutes ?? 0,
        date: record.date ? (record.date instanceof Date ? record.date.toISOString() : new Date(record.date).toISOString()) : new Date(record.created_at).toISOString(),
      }));
    }

    // For teacher, educator, kepengasuhan
    const collection = db.collection("attendance");
    const records = await collection
      .find({ type: role })
      .sort({ created_at: -1 })
      .toArray();

    return records.map(record => ({
      _id: record._id.toString(),
      name: record.name,
      timestamp: record.created_at.toLocaleString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }),
      type: record.type as "admin" | "teacher", // Cast to match interface, or update interface
      faceDescriptor: record.face_descriptor,
      is_late: record.is_late ?? false,
      late_minutes: record.late_minutes ?? 0,
      date: (record.date instanceof Date ? record.date : new Date(record.date)).toISOString(),
    }));

  } catch (error) {
    console.error(`Error in getAttendanceRecordsByRole for ${role}:`, error);
    throw error;
  }
}

export interface TeacherLeaveForHistory {
  teacher_name: string;
  date: string;
  slot_label: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export async function getTeacherLeavesForHistory(): Promise<TeacherLeaveForHistory[]> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    const rows = await db
      .collection("teacher_leave_requests")
      .aggregate([
        {
          $match: {
            status: { $in: ["pending", "approved", "rejected"] },
          },
        },
        {
          $lookup: {
            from: "teachers",
            localField: "teacher_id",
            foreignField: "_id",
            as: "teacher",
          },
        },
        { $unwind: "$teacher" },
        {
          $lookup: {
            from: "users",
            localField: "teacher.user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0,
            teacher_name: "$user.name",
            date: "$date",
            slot_label: 1,
            reason: 1,
            status: 1,
          },
        },
        { $sort: { date: -1 } },
      ])
      .toArray();

    return rows.map((row: any) => ({
      teacher_name: row.teacher_name as string,
      date:
        row.date instanceof Date
          ? row.date.toISOString()
          : new Date(row.date).toISOString(),
      slot_label: (row.slot_label as string) || "",
      reason: (row.reason as string) || "",
      status:
        (row.status as "pending" | "approved" | "rejected") || "pending",
    }));
  } catch (error) {
    console.error("Error in getTeacherLeavesForHistory:", error);
    throw error;
  }
}

export async function getTeacherRoles(): Promise<TeacherRoleInfo[]> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    const teachers = await db
      .collection("teachers")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user_data",
          },
        },
        { $unwind: "$user_data" },
        {
          $project: {
            _id: 0,
            name: "$user_data.name",
            role: "$user_data.role",
          },
        },
      ])
      .toArray();

    return teachers
      .map((teacher: any) => ({
        name: teacher.name as string,
        role: teacher.role as string,
      }))
      .filter(item => !!item.name && !!item.role);
  } catch (error) {
    console.error("Error in getTeacherRoles:", error);
    throw error;
  }
}

export async function getUserNamesByRoles(roles: string[]): Promise<string[]> {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    const users = await db
      .collection("users")
      .find(
        {
          role: { $in: roles },
        },
        {
          projection: {
            _id: 0,
            name: 1,
          },
        }
      )
      .sort({ name: 1 })
      .toArray();

    return users
      .map((user: any) => user.name as string)
      .filter(name => !!name);
  } catch (error) {
    console.error("Error in getUserNamesByRoles:", error);
    throw error;
  }
}

export async function removeAttendancePhotos() {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");

    await db.collection("attendance").updateMany(
      {},
      { $unset: { photo: "" } }
    );

    await db.collection("admin_attendance").updateMany(
      {},
      { $unset: { photo: "" } }
    );
  } catch (error) {
    console.error("Error removing attendance photos:", error);
    throw error;
  }
}
