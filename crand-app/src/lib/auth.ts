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
        
        console.log(`[Auth] Attempting login for email: ${emailInput}`);
        
        const user = await db.collection("users").findOne({ email: { $regex: emailRegex } });

        if (!user) {
          console.log(`[Auth] User not found for email: ${emailInput}`);
          return null;
        }

        const isValid = await compare(credentials.password, user.password);
        console.log(`[Auth] Password check for ${emailInput}: ${isValid}`);
        
        if (!isValid) return null;

        console.log(`[Auth] Login successful for ${emailInput}, role: ${user.role}`);

        // Handle large profile pictures to prevent cookie overflow (max 4KB limit for cookies)
        let profilePicture = user.profile_picture;
        if (profilePicture && profilePicture.length > 5000) { // Safe limit for cookie size
          console.warn(`[Auth] Profile picture for ${emailInput} is too large (${profilePicture.length} chars). Excluding from session token to prevent login error.`);
          profilePicture = null; 
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as "admin" | "teacher" | "student" | "hrd" | "educator" | "manager" | "adminhrd" | "kepengasuhan" | "staff" | "parenting",
          profile_picture: profilePicture,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.profile_picture = user.profile_picture;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as "admin" | "teacher" | "student" | "hrd" | "educator" | "manager" | "adminhrd" | "kepengasuhan" | "staff" | "parenting";
      session.user.image = token.profile_picture as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
};

// Untuk file API auth [...nextauth]/route.ts
const handler = (req: any, res: any) => NextAuth(req, res, authOptions);
export { handler as GET, handler as POST };
