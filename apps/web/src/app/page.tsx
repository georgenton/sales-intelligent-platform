import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const cookieStore = await cookies();
  redirect(cookieStore.has('sip_session') ? '/app/dashboard' : '/login');
}
