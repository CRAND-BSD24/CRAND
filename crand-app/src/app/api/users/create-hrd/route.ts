import { NextResponse } from "next/server";
import { getMongoClientInstance } from "@/db/config/connection";
import bcrypt from 'bcrypt';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // AdminHRD Restriction
    if (session?.user?.role === 'adminhrd') {
      return NextResponse.json({ message: "Permission denied: AdminHRD cannot create/update HRD role" }, { status: 403 });
    }

    const client = await getMongoClientInstance();
    const db = client.db('pesantren_db');

    const email = 'hrd@mail.com';
    const username = 'hrd';
    const password = 'hrd123';

    // Single HRD Constraint
    // Check if any user has HRD role
    const existingHrdRole = await db.collection('users').findOne({ role: 'hrd' });
    
    // If an HRD exists, and it's NOT the one we are trying to create/update (by email), then forbid.
    if (existingHrdRole && existingHrdRole.email !== email) {
      return NextResponse.json({ 
        message: "Constraint violation: Another user already has the HRD role. Only one HRD user is allowed." 
      }, { status: 400 });
    }

    const existing = await db.collection('users').findOne({ email: { $regex: /^hrd@mail\.com$/i } });
    const hashed = await bcrypt.hash(password, 10);
    const now = new Date();

    if (existing) {
      await db.collection('users').updateOne(
        { _id: existing._id },
        { $set: {
            name: 'HRD',
            email: email, // simpan lowercase untuk konsistensi
            username,
            password: hashed,
            role: 'hrd',
            updated_at: now,
        }}
      );
      return NextResponse.json({ message: 'HRD user upserted (updated)', id: existing._id.toString() });
    }

    const insert = await db.collection('users').insertOne({
      name: 'HRD',
      email,
      username,
      password: hashed,
      role: 'hrd',
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json({ message: 'HRD user created', id: insert.insertedId.toString() });
  } catch (e) {
    console.error('Create HRD error:', e);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}