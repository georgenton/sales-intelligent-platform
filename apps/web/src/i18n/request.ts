import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { APP_TIME_ZONE, LOCALE_COOKIE, resolveAppLocale } from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requestedLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = resolveAppLocale(requestedLocale);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: APP_TIME_ZONE,
  };
});
