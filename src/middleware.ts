import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/auth/signin',
  '/auth/signup',
  '/auth/password-reset',
  '/auth/password-reset/confirm',
];

// Routes that require authentication
const protectedRoutes = [
  '/merchant-portal',
];

export function middleware(request: NextRequest) {
  // Get the current page path
  const path = request.nextUrl.pathname;

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  // Allow public routes to pass through
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isPublicRoute) {
    return NextResponse.redirect(new URL('/merchant-portal', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/merchant-portal/:path*',
    '/auth/:path*',
    '/api/:path*',
    '/signin',
    '/signup'
  ]
};

