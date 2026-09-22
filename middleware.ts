import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Refresh de sessão Supabase ──────────────────────────────────────────
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ── 2. Proteção das rotas do dashboard ────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Proteção por role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;

    if (pathname.startsWith('/dashboard/empresa') && role !== 'empresa' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (pathname.startsWith('/dashboard/guia') && role !== 'guia' && role !== 'empresa' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (pathname.startsWith('/dashboard/super-admin') && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // ── 3. Injetar contexto de modo (marketplace vs. white-label) ────────────
  // As rotas /agencia/[slug] já isolam naturalmente pelo segmento de URL.
  // Injetamos um header para que o layout saiba o modo atual.
  if (pathname.startsWith('/agencia/')) {
    response.headers.set('x-rotabase-mode', 'white-label');
  } else {
    response.headers.set('x-rotabase-mode', 'marketplace');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
};
