'use server';

import { cookies } from 'next/headers';

export async function meServer() {
  const cookieStore = await cookies();

  const res = await fetch("http://localhost:4000/api/auth/me", {
    method: "GET",
    headers: {
      Cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}
