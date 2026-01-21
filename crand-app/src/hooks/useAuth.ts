'use client';

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useAuth(requiredRole?: 'admin' | 'teacher' | 'student' | 'hrd' | 'educator' | 'manager') {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const userRole = session?.user?.role;
  
  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // If authenticated and there is a required role that doesn't match, redirect
    if (isAuthenticated && requiredRole && userRole !== requiredRole && pathname) {
      // Check if we're already on the correct path to prevent redirect loops
      if (userRole === 'admin' && !pathname.startsWith('/admin')) {
        router.push('/admin');
      } else if (userRole === 'teacher' && !pathname.startsWith('/teacher')) {
        router.push('/teacher');
      } else if (userRole === 'student' && !pathname.startsWith('/student')) {
        router.push('/student');
      } else if (userRole === 'hrd' && !pathname.startsWith('/hrd')) {
        router.push('/hrd');
      } else if (userRole === 'educator' && !pathname.startsWith('/educator')) {
        router.push('/educator');
      } else if (userRole === 'manager' && !pathname.startsWith('/manager')) {
        router.push('/manager');
      }
    }
  }, [isLoading, isAuthenticated, userRole, requiredRole, router, pathname]);
  
  return {
    isLoading,
    isAuthenticated,
    user: session?.user,
    role: userRole
  };
}