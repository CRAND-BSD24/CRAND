'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';
import { ReactNode } from 'react';
import { Role } from "@/types/role";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Role;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, role } = useAuth(requiredRole);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    // The useAuth hook handles redirects, this is just a fallback
    return null;
  }

  // If a role is required but the user doesn't have it, don't render
  // The useAuth hook redirects, but this prevents flashes of unauthorized content
  if (requiredRole && role !== requiredRole) {
    // Exception for adminhrd accessing hrd routes
    if (requiredRole === 'hrd' && role === 'adminhrd') {
      return <>{children}</>;
    }
    return null;
  }

  return <>{children}</>;
}