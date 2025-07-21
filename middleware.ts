import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

const PRIVATE_PATHS = ['/myTanks', '/profile'];

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;
  const isAuthed = session && session.user;

  // Проверка приватных роутов
  if (PRIVATE_PATHS.some((p) => pathname.startsWith(p)) && !isAuthed) {
    return NextResponse.redirect(new URL('/signIn', request.url));
  }

  // Если авторизован и на странице входа — редирект на главную
  if (pathname === '/signIn' && isAuthed) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/myTanks/:path*', '/profile/:path*', '/signIn']
};
