import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import { cookies } from "next/headers";

// Can be imported from a shared config
const locales = ['en', 'ru', 'az'];



export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    locale,
  };
});