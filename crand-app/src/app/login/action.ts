'use server'

import { getMongoClientInstance } from "@/db/config/connection";
import { compare } from "bcrypt";

export async function validateUser(email: string, password: string) {
  try {
    const client = await getMongoClientInstance();
    const db = client.db("pesantren_db");
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return null;
    }

    const passwordValid = await compare(password, user.password);

    if (!passwordValid) {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error("Error validating user:", error);
    return null;
  }
} 