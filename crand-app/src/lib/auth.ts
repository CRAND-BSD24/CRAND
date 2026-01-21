// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import NextAuth from "next-auth/next";
import { getMongoClientInstance } from "@/db/config/connection";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const client = await getMongoClientInstance();
        const db = client.db("pesantren_db");

        const emailInput = String(credentials.email || '').trim();
        const emailRegex = new RegExp(`^${escapeRegExp(emailInput)}$`, 'i');
        const user = await db.collection("users").findOne({ email: { $regex: emailRegex } });

        if (!user) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as "admin" | "teacher" | "student" | "hrd" | "educator" | "manager",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as "admin" | "teacher" | "student" | "hrd" | "educator" | "manager";
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
};

// Untuk file API auth [...nextauth]/route.ts
const handler = (req: any, res: any) => NextAuth(req, res, authOptions);
export { handler as GET, handler as POST };
