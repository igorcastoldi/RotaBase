'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function CadastroPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'client' | 'company' | 'guide'>('client')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role, // Envia o cargo escolhido
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
        <h1 className="text-2xl font-black text-orange-500 mb-1 text-center uppercase tracking-wide">
          Criar Conta no RotaBase
        </h1>
        <p className="text-neutral-400 text-xs text-center mb-6">
          Selecione o seu perfil de acesso abaixo
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Tipo de Perfil
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                  role === 'client'
                    ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20'
                    : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                Aventureiro (Cliente)
              </button>
              <button
                type="button"
                onClick={() => setRole('company')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                  role === 'company'
                    ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20'
                    : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                Empresa / Agência
              </button>
              <button
                type="button"
                onClick={() => setRole('guide')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                  role === 'guide'
                    ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20'
                    : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                Guia Oficial
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-3 rounded-xl text-sm transition mt-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 uppercase tracking-wider"
          >
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
          </button>
        </form>
      </div>
    </div>
  )
}
