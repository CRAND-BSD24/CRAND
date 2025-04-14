"use server";

import { signOut } from "next-auth/react";
import { cookies } from "next/headers";

export async function logout() {
  // Clear all cookies
  const cookieStore = cookies();
  const allCookies = await cookieStore.getAll();

  for (const cookie of allCookies) {
    await cookieStore.delete(cookie.name);
  }

  // We're using server action, but client component still needs to call signOut
  // This function will be used from client components
  return { success: true };
}
