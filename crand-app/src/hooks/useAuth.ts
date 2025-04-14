"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useAuth(requiredRole?: "admin" | "teacher" | "student") {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const userRole = session?.user?.role;

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // If authenticated and there is a required role that doesn't match, redirect
    if (isAuthenticated && requiredRole && userRole !== requiredRole) {
      // Check if we're already on the correct path to prevent redirect loops
      if (pathname && userRole === "admin" && !pathname.startsWith("/admin")) {
        router.push("/admin");
      } else if (
        pathname &&
        userRole === "teacher" &&
        !pathname.startsWith("/teacher")
      ) {
        router.push("/teacher");
      } else if (
        pathname &&
        userRole === "student" &&
        !pathname.startsWith("/student")
      ) {
        router.push("/student");
      }
    }
  }, [isLoading, isAuthenticated, userRole, requiredRole, router, pathname]);

  return {
    isLoading,
    isAuthenticated,
    user: session?.user,
    role: userRole,
  };
}
