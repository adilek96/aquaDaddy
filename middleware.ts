import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ru', 'az'],
  defaultLocale: 'en'
});

export async function middleware(request: NextRequest) {
  const [intlResponse, session] = await Promise.all([
    intlMiddleware(request),
    auth()
  ]);

  if (!intlResponse) return NextResponse.next();

  const currentPath = request.nextUrl.pathname;
  const localePrefix = currentPath.substring(0, 4); // "/az/", "/ru/", etc.
  const pathAfterLocale = currentPath.substring(4);

  const isAuthed = session && session.user;

  if ((pathAfterLocale.startsWith('myTanks') || pathAfterLocale.startsWith('profile')) && !isAuthed) {
    return NextResponse.redirect(new URL(`${localePrefix}signIn`, request.url));
  }

  if (pathAfterLocale.startsWith('signIn') && isAuthed) {
    return NextResponse.redirect(new URL(`${localePrefix}`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ['/', '/(az|ru|en)/:path*']
};
