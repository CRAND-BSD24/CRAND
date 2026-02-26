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
    const homeUrl = role === 'adminhrd' ? '/adminhrd' : `/${role}`;
    
    // Admin routes
    if (pathname.startsWith('/admin') && role !== 'admin' && !pathname.startsWith('/adminhrd')) {
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }

    // AdminHRD routes
    if (pathname.startsWith('/adminhrd') && role !== 'adminhrd') {
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }
    
    // Teacher routes
    if (pathname.startsWith('/teacher') && role !== 'teacher') {
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }
    
    // Student routes
    if (pathname.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }

    // HRD routes
    if (pathname.startsWith('/hrd')) {
      if (role !== 'hrd' && role !== 'adminhrd') {
        return NextResponse.redirect(new URL(homeUrl, request.url));
      }

      // Redirect adminhrd from /hrd to /adminhrd
      if (role === 'adminhrd' && pathname === '/hrd') {
        return NextResponse.redirect(new URL('/adminhrd', request.url));
      }

      // Block adminhrd from payroll routes
      if (role === 'adminhrd' && (
        pathname.startsWith('/hrd/salaries') ||
        pathname.startsWith('/hrd/teacherSalaries') ||
        pathname.startsWith('/hrd/teacherFixedCuts') ||
        pathname.startsWith('/hrd/payrolls') ||
        pathname.startsWith('/hrd/payrollBonuses') ||
        pathname.startsWith('/hrd/additionalSalaries') ||
        pathname.startsWith('/hrd/weeklyPayrolls') ||
        pathname.startsWith('/hrd/hourPayrolls')
      )) {
        return NextResponse.redirect(new URL('/adminhrd', request.url));
      }
    }

    // Educator routes
    if (pathname.startsWith('/educator') && role !== 'educator') {
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }

    // Manager routes
    if (pathname.startsWith('/manager') && role !== 'manager') {
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }

    // Staff routes
    if (pathname.startsWith('/staff') && role !== 'staff') {
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }

    // Kepengasuhan routes
    if (pathname.startsWith('/kepengasuhan') && role !== 'kepengasuhan') {
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }

    // Parenting routes
    if (pathname.startsWith('/parenting') && role !== 'parenting') {
      return NextResponse.redirect(new URL(homeUrl, request.url));
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