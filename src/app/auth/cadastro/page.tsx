'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { Mountain, Loader2, CheckCircle } from 'lucide-react';

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    setLoading(false);
    if (error) {
      setError('Não foi possível concluir o cadastro. Tente novamente.');
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow border border-stone-100 p-8 text-center space-y-4">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
          <h1 className="text-xl font-bold text-stone-800">Cadastro realizado!</h1>
          <p className="text-stone-600 text-sm">
            Enviamos um e-mail de confirmação. Verifique sua caixa de entrada para ativar sua conta.
          </p>
          <Link href="/auth/login" className="btn-primary w-full">Ir para o login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2 font-extrabold text-2xl text-stone-900">
          <Mountain className="w-7 h-7 text-amber-500" /> RotaBase
        </Link>
        <div className="bg-white rounded-2xl shadow border border-stone-100 p-6 space-y-5">
          <h1 className="text-xl font-bold text-stone-800 text-center">Criar sua conta</h1>
          {error && <p className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5">{error}</p>}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Nome completo</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="input-base" placeholder="Seu nome" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">E-mail</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-base" placeholder="voce@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Telefone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="input-base" placeholder="(85) 99999-9999" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Senha</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-base" placeholder="Mínimo 6 caracteres" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Cadastrando...</> : 'Criar conta'}
            </button>
          </form>
          <p className="text-center text-sm text-stone-500">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-amber-600 font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
