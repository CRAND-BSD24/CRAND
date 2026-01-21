import { NextResponse } from "next/server";
import { getMongoClientInstance } from "@/db/config/connection";
import bcrypt from 'bcrypt';

// Simple GET route to upsert a default Manager user
export async function GET() {
  try {
    const client = await getMongoClientInstance();
    const db = client.db('pesantren_db');

    const email = 'manager@mail.com';
    const username = 'manager';
    const password = 'manager123';

    const existing = await db.collection('users').findOne({ email: { $regex: /^manager@mail\.com$/i } });
    const hashed = await bcrypt.hash(password, 10);
    const now = new Date();

    if (existing) {
      await db.collection('users').updateOne(
        { _id: existing._id },
        { $set: {
            name: 'Manager',
            email: email,
            username,
            password: hashed,
            role: 'manager',
            updated_at: now,
        }}
      );
      return NextResponse.json({ message: 'Manager user upserted (updated)', id: existing._id.toString() });
    }

    const insert = await db.collection('users').insertOne({
      name: 'Manager',
      email,
      username,
      password: hashed,
      role: 'manager',
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json({ message: 'Manager user created', id: insert.insertedId.toString() });
  } catch (e) {
    console.error('Create Manager error:', e);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}