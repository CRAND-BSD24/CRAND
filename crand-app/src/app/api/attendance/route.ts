import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const photo = formData.get("photo") as string;
    const faceDescriptor = JSON.parse(formData.get("faceDescriptor") as string);
    const type = (formData.get("type") as string) || "teacher";

    if (!photo || !faceDescriptor) {
      return NextResponse.json(
        { success: false, message: "Data wajah tidak lengkap" },
        { status: 400 }
      );
    }

    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    const faceDataCollection = db.collection("face_data");
    const threshold = 0.6;

    // Fungsi untuk menghitung jarak euclidean antara dua face descriptor
    const calculateDistance = (
      descriptor1: number[],
      descriptor2: number[]
    ) => {
      return Math.sqrt(
        descriptor1.reduce(
          (sum, val, i) => sum + Math.pow(val - descriptor2[i], 2),
          0
        )
      );
    };

    if (type === "teacher") {
      // Cek apakah guru ada di database
      const existingTeacher = await db.collection("teachers").findOne({
        user_id: new ObjectId(session.user.id),
      });

      if (!existingTeacher) {
        return NextResponse.json(
          { success: false, message: "Guru tidak ditemukan" },
          { status: 404 }
        );
      }

      // Ambil data user untuk nama
      const userData = await db.collection("users").findOne({
        _id: new ObjectId(session.user.id),
      });

      if (!userData || !userData.name) {
        return NextResponse.json(
          { success: false, message: "Data user tidak lengkap" },
          { status: 404 }
        );
      }

      // Cek apakah guru sudah terdaftar di face_data
      const existingFaceData = await faceDataCollection.findOne({
        user_id: existingTeacher._id,
        user_type: "teacher",
      });

      if (!existingFaceData) {
        // Daftarkan wajah baru
        await faceDataCollection.insertOne({
          descriptor: faceDescriptor,
          name: userData.name,
          user_id: existingTeacher._id,
          user_type: "teacher",
          created_at: new Date(),
        });
      } else {
        // Cocokkan wajah dengan data yang tersimpan
        const distance = calculateDistance(
          faceDescriptor,
          existingFaceData.descriptor
        );
        if (distance >= threshold) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Wajah tidak cocok. Harap absen dengan wajah Anda sendiri",
            },
            { status: 400 }
          );
        }
      }

      // Simpan data absensi guru
      const attendance = {
        teacher_id: existingTeacher._id,
        date: new Date(),
        photo,
        face_descriptor: faceDescriptor,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await db.collection("teacher_attendance").insertOne(attendance);

      const timestamp = new Date().toLocaleString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      return NextResponse.json({
        success: true,
        message: "Absensi guru berhasil",
        name: userData.name,
        timestamp: timestamp,
      });
    } else if (type === "admin") {
      // Cek apakah admin ada di database
      const existingAdmin = await db.collection("users").findOne({
        _id: new ObjectId(session.user.id),
        role: "admin",
      });

      if (!existingAdmin) {
        return NextResponse.json(
          { success: false, message: "Admin tidak ditemukan" },
          { status: 404 }
        );
      }

      if (!existingAdmin.name) {
        return NextResponse.json(
          { success: false, message: "Data admin tidak lengkap" },
          { status: 404 }
        );
      }

      // Cek apakah admin sudah terdaftar di face_data
      const existingFaceData = await faceDataCollection.findOne({
        user_id: existingAdmin._id,
        user_type: "admin",
      });

      if (!existingFaceData) {
        // Daftarkan wajah baru
        await faceDataCollection.insertOne({
          descriptor: faceDescriptor,
          name: existingAdmin.name,
          user_id: existingAdmin._id,
          user_type: "admin",
          created_at: new Date(),
        });
      } else {
        // Cocokkan wajah dengan data yang tersimpan
        const distance = calculateDistance(
          faceDescriptor,
          existingFaceData.descriptor
        );
        if (distance >= threshold) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Wajah tidak cocok. Harap absen dengan wajah Anda sendiri",
            },
            { status: 400 }
          );
        }
      }

      // Simpan data absensi admin
      const attendance = {
        admin_id: existingAdmin._id,
        date: new Date(),
        photo,
        face_descriptor: faceDescriptor,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await db.collection("admin_attendance").insertOne(attendance);

      const timestamp = new Date().toLocaleString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      return NextResponse.json({
        success: true,
        message: "Absensi admin berhasil",
        name: existingAdmin.name,
        timestamp: timestamp,
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Tipe absensi tidak valid" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in attendance API:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
