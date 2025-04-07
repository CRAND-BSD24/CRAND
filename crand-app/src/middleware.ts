import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Paths that are accessible without authentication
  const publicPaths = ['/login'];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Get the token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // If the path is public and user is logged in, redirect based on role
  if (isPublicPath && token) {
    const role = token.role as string;
    
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (role === 'teacher') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    } else if (role === 'student') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
  }

  // If the path is not public and user is not logged in, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access control
  if (token) {
    const role = token.role as string;
    
    // Admin routes
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    
    // Teacher routes
    if (pathname.startsWith('/teacher') && role !== 'teacher') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    
    // Student routes
    if (pathname.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 