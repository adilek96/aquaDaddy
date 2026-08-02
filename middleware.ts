import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

const PRIVATE_PATHS = ['/myTanks', '/profile'];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API отвечает мобильному приложению и дашборду с другого origin.
  // Выходим до auth(), чтобы не дёргать сессию на каждый запрос к API.
  if (pathname.startsWith('/api')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
    }

    const response = NextResponse.next();
    for (const [header, value] of Object.entries(CORS_HEADERS)) {
      response.headers.set(header, value);
    }
    return response;
  }

  const session = await auth();
  const isAuthed = Boolean(session?.user);

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
  matcher: ['/', '/api/:path*', '/myTanks/:path*', '/profile/:path*', '/signIn'],
};
