import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'ru', 'az'];

import { headers } from 'next/headers';

export default getRequestConfig(async () => {
  const headersList = headers();
  const locale = headersList.get('x-next-intl-locale') || 'en';

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    locale,
  };
});