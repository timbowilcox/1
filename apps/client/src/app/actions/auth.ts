'use server';

import { cookies } from 'next/headers';
import { env } from '@/lib/env';

export async function meServer() {
  const cookieStore = await cookies();

  const res = await fetch(`${env.apiUrl}/api/auth/me`, {
    method: "GET",
    headers: {
      Cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}
