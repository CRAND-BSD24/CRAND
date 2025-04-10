import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a logout request
  const isLogout = pathname.includes('/api/auth/signout');
  if (isLogout) {
    // Allow the logout request to proceed without interference
    return NextResponse.next();
  }
  
  // Paths that are accessible without authentication
  const publicPaths = ['/', '/login'];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname === path || 
    (path !== '/' && pathname.startsWith(path)));
  
  // Get the token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // If we're on the login page and user is already authenticated, redirect based on role
  if (pathname === '/login' && token) {
    const role = token.role as string;
    
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (role === 'teacher') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    } else if (role === 'student') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
    
    // Default fallback
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If the path is not public and user is not logged in, redirect to login
  if (!isPublicPath && !token) {
    // Append the original URL as a query parameter for redirecting back after login
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(url);
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|public).*)'
  ],
}; 