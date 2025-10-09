import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Protected routes that require authentication (support both hyphen and underscore folder names)
const protectedRoutes = ['/search', '/booking', '/my-bookings', '/my_bookings'];

export async function middleware(request) {
  const cookieEntry = request.cookies.get && request.cookies.get('auth-token');
  const token = cookieEntry ? cookieEntry.value : null;

  // Check if current path is protected
  const pathname = request.nextUrl?.pathname || '';
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token
    const payload = token ? await verifyToken(token) : null;
    if (!payload) {
      // Redirect to login if invalid token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/search/:path*', '/booking/:path*', '/my-bookings/:path*', '/my_bookings/:path*'],
};