import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is an auth-related request
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Paths that are accessible without authentication
  const publicPaths = ['/', '/login', '/logout', '/api/users/create-manager'];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname === path || 
    (path !== '/' && pathname.startsWith(path)));
  
  // Get the token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Note: Jangan redirect otomatis dari /login meskipun sudah authenticated.
  // Pengguna harus memasukkan email dan password terlebih dahulu.

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

    // HRD routes
    if (pathname.startsWith('/hrd') && role !== 'hrd') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    // Educator routes
    if (pathname.startsWith('/educator') && role !== 'educator') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    // Manager routes
    if (pathname.startsWith('/manager') && role !== 'manager') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images|public|login).*)',
  ],
};