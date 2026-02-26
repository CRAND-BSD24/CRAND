"use server";

import { getMongoClientInstance } from "@/db/config/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export interface BisyarohSlip {
  _id: string;
  date: string;
  total: number;
  pph21: number;
  status: string;
  month_name: string;
  year: string;
  details: {
    income: { name: string; amount: number }[];
    deduction: { name: string; amount: number }[];
  };
}

export async function getMyBisyaroh() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return [];
  }

  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");

  // Find the teacher linked to this user
  const user = await db.collection("users").findOne({ email: session.user.email });
  if (!user) return [];

  const teacher = await db.collection("teachers").findOne({ user_id: user._id });
  if (!teacher) return [];

  // Find bonuses/bisyaroh for this teacher that are 'sent' or 'published'
  const bonuses = await db.collection("teacher_bonuses")
    .find({ 
      teacher_id: teacher._id,
      status: "sent" // Only show sent slips
    })
    .sort({ date: -1 })
    .toArray();

  return bonuses.map(b => {
    const d = new Date(b.date);
    return {
      _id: b._id.toString(),
      date: b.date,
      total: b.total || 0,
      pph21: b.pph21 || 0,
      status: b.status || "draft",
      month_name: d.toLocaleString('id-ID', { month: 'long' }),
      year: d.getFullYear().toString(),
      details: {
        income: b.income_details || [],
        deduction: b.deduction_details || []
      }
    };
  });
}
