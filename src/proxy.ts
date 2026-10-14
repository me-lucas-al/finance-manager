import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
const ONBOARDING_PATH = '/onboarding';

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (isLoggedIn && !req.auth?.user?.onboarded && pathname !== ONBOARDING_PATH) {
    return NextResponse.redirect(new URL(ONBOARDING_PATH, req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)',
  ],
};
