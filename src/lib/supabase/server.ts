import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // When the Supabase env vars are not present in this runtime, return null so
  // callers can degrade gracefully instead of crashing the whole request.
  if (!url || !anonKey) {
    return null as unknown as ReturnType<typeof createSupabaseServerClient>;
  }

  const cookieStore = cookies();
  return createSupabaseServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
