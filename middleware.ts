import createMiddleware from 'next-intl/middleware';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


// Создаем middleware для интернационализации
const intlMiddleware = createMiddleware({
  locales: ['en', 'ru', 'az'],
  defaultLocale: 'en'
});

export async function middleware(request: NextRequest) {

  // Запускаем два промиса параллельно: интернационализация и проверка пользователя
  const intlPromise = intlMiddleware(request); // Промис для обработки локализации

  

  const [intlResponse] = await Promise.all([intlPromise]);

  // Проверяем, был ли ответ от i18n middleware
  if (intlResponse) {

  const currentPath = request.nextUrl.pathname;
  

  // // Проверяем аутентификацию для нужных маршрутов
  // if ((currentPath.substring(4).startsWith("myTanks") || currentPath.substring(4).startsWith("profile")) && user.ok === false) {
  //   return NextResponse.redirect(new URL(`${currentPath.substring(0, 4)}signIn`, request.url));
  // }
  // if ((currentPath.substring(4).startsWith("signIn") || currentPath.substring(4).startsWith("signUp") || currentPath.substring(4).startsWith("reset-password") || currentPath.substring(4).startsWith("forgot-password")) && user.ok === true) {
  //   return NextResponse.redirect(new URL(`${currentPath.substring(0, 3)}`, request.url));
  // }
 

  return NextResponse.next(), intlResponse;
  
}
}

export const config = {
  matcher: ['/', '/(az|ru|en)/:path*']
};
