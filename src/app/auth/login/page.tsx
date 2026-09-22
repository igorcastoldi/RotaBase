'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { Mountain, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError('E-mail ou senha inválidos.');
      return;
    }
    const next = searchParams.get('next') ?? '/dashboard';
    router.push(next);
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2 font-extrabold text-2xl text-stone-900">
          <Mountain className="w-7 h-7 text-amber-500" /> RotaBase
        </Link>
        <div className="bg-white rounded-2xl shadow border border-stone-100 p-6 space-y-5">
          <h1 className="text-xl font-bold text-stone-800 text-center">Entrar na sua conta</h1>
          {error && <p className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">E-mail</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-base" placeholder="voce@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Senha</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-base" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Entrando...</> : 'Entrar'}
            </button>
          </form>
          <p className="text-center text-sm text-stone-500">
            Não tem conta?{' '}
            <Link href="/auth/cadastro" className="text-amber-600 font-semibold hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-stone-50">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
