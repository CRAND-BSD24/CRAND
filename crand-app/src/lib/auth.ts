// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import NextAuth from "next-auth/next";
import { getMongoClientInstance } from "@/db/config/connection";

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

        const user = await db.collection("users").findOne({ email: credentials.email });

        if (!user) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as "admin" | "teacher" | "student",
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
      session.user.role = token.role as "admin" | "teacher" | "student";
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
};

// Untuk file API auth [...nextauth]/route.ts
const handler = (req: any, res: any) => NextAuth(req, res, authOptions);
export { handler as GET, handler as POST };
