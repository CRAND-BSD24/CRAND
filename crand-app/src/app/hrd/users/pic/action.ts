"use server";
import { getMongoClientInstance } from "@/db/config/connection";
import { ObjectId } from "mongodb";

export async function getPicUsers() {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const items = await db.collection("pic_users").aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        user_id: 1,
        user_email: 1,
        name: "$user.name",
        email: "$user.email"
      }
    }
  ]).toArray();
  return items.map((it: any) => ({ id: it._id?.toString(), name: it.name || "", email: it.email || it.user_email || "" }));
}

export async function addPicByEmail(email: string) {
  const client = await getMongoClientInstance();
  const db = client.db("pesantren_db");
  const user = await db.collection("users").findOne({ email });
  if (!user) return { success: false, message: "User tidak ditemukan" };
  await db.collection("pic_users").updateOne(
    { user_id: user._id },
    { $set: { user_id: user._id, user_email: email, updated_at: new Date() }, $setOnInsert: { created_at: new Date() } },
    { upsert: true }
  );
  return { success: true };
}