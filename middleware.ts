import createMiddleware from 'next-intl/middleware';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserMeLoader } from "@/app/services/get-user-me-loader";

// Создаем middleware для интернационализации
const intlMiddleware = createMiddleware({
  locales: ['en', 'ru', 'az'],
  defaultLocale: 'en'
});

export async function middleware(request: NextRequest) {
  // Запускаем два промиса параллельно: интернационализация и проверка пользователя
  const intlPromise = intlMiddleware(request); // Промис для обработки локализации
  const userPromise = getUserMeLoader(); // Промис для получения пользователя

  const [intlResponse, user] = await Promise.all([intlPromise, userPromise]);

  // Проверяем, был ли ответ от i18n middleware
  if (intlResponse) {

  const currentPath = request.nextUrl.pathname;

  // Проверяем аутентификацию для нужных маршрутов
  if ((currentPath.substring(4).startsWith("myTanks") || currentPath.substring(4).startsWith("profile")) && user.ok === false) {
    return NextResponse.redirect(new URL(`${currentPath.substring(0, 4)}signIn`, request.url));
  }
  if ((currentPath.substring(4).startsWith("signIn") || currentPath.substring(4).startsWith("signUp")) && user.ok === true) {
    return NextResponse.redirect(new URL(`${currentPath.substring(0, 3)}`, request.url));
  }

  return NextResponse.next(), intlResponse;
}
}

export const config = {
  matcher: ['/', '/(az|ru|en)/:path*']
};
