import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:4000';

export async function apiFetch<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const response = await fetch(`${apiOrigin}${path}`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (response.status === 401) redirect('/login');
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return (await response.json()) as T;
}
