'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import { Binary } from 'bson';

interface AttendanceResponse {
  success: boolean;
  message: string;
  isNewFace?: boolean;
  name?: string;
  timestamp?: Date;
}

export async function handleAbsensi(formData: FormData): Promise<AttendanceResponse> {
  try {
    const base64Image = formData.get('photo') as string;
    const name = formData.get('name') as string;
    const faceDescriptor = formData.get('faceDescriptor') as string;

    if (!base64Image) {
      return { success: false, message: 'Tidak ada foto yang diupload' };
    }

    if (!faceDescriptor) {
      return { success: false, message: 'Tidak ada deskriptor wajah yang ditemukan' };
    }

    // Convert base64 to buffer for MongoDB storage
    const buffer = Buffer.from(base64Image, 'base64');

    const client = await getMongoClientInstance();
    const db = client.db('pesantren_db');
    const faceDataCollection = db.collection('face_data');
    const attendanceCollection = db.collection('attendance');

    // Parse the face descriptor
    let descriptor: number[];
    try {
      descriptor = JSON.parse(faceDescriptor);
      if (!Array.isArray(descriptor) || descriptor.length === 0) {
        throw new Error('Invalid face descriptor format');
      }
    } catch (error) {
      return { success: false, message: 'Format deskriptor wajah tidak valid' };
    }

    // Check if face is already registered
    const existingFaces = await faceDataCollection.find({}).toArray();
    const threshold = 0.6; // Adjust this threshold based on testing

    if (existingFaces.length > 0) {
      // Find the closest matching face
      let minDistance = Infinity;
      let matchedFace = null;

      for (const face of existingFaces) {
        if (!Array.isArray(face.descriptor) || face.descriptor.length === 0) {
          continue;
        }

        const distance = Math.sqrt(
          descriptor.reduce((sum: number, val: number, i: number) => 
            sum + Math.pow(val - face.descriptor[i], 2), 0)
        );

        if (distance < minDistance) {
          minDistance = distance;
          matchedFace = face;
        }
      }

      if (matchedFace && minDistance < threshold) {
        // Face recognized, record attendance
        const timestamp = new Date();
        await attendanceCollection.insertOne({
          name: matchedFace.name,
          timestamp,
          photo: new Binary(buffer),
        });

        return { 
          success: true, 
          message: `Absensi berhasil! Selamat datang ${matchedFace.name}`,
          isNewFace: false,
          name: matchedFace.name,
          timestamp
        };
      }
    }

    // If face is not recognized and name is provided, register new face
    if (name) {
      const timestamp = new Date();
      await faceDataCollection.insertOne({
        descriptor,
        name,
        createdAt: timestamp
      });

      await attendanceCollection.insertOne({
        name,
        timestamp,
        photo: new Binary(buffer),
      });

      return { 
        success: true, 
        message: `Wajah berhasil didaftarkan! Selamat datang ${name}`,
        isNewFace: true,
        name,
        timestamp
      };
    }

    return { 
      success: false, 
      message: 'Wajah tidak dikenali. Silakan daftarkan wajah Anda terlebih dahulu.',
      isNewFace: true
    };
  } catch (error) {
    console.error('Attendance error:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat memproses absensi'
    };
  }
}
