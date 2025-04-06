'use server';

import { getMongoClientInstance } from "@/db/config/connection";
import { Binary } from 'bson';

export async function handleAbsensi(formData: FormData) {
  const file = formData.get('photo') as File;

  if (!file) {
    return { success: false, message: 'Tidak ada file yang diupload' };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const client = await getMongoClientInstance();
  const db = client.db('pesantren_db'); 
  const absensiCollection = db.collection('users');
  // TODO: buat kolom baru untuk simpen buffer foto

  const result = await absensiCollection.insertOne({
    uploadedAt: new Date(),
    filename: file.name,
    contentType: file.type,
    photo: new Binary(buffer),
  });

  return { success: true, message: 'Absensi berhasil!', insertedId: result.insertedId };
}
