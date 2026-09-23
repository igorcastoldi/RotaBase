'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // A CORREÇÃO ESTÁ AQUI:
  // Colocamos a criação do cliente dentro de um useState para garantir que a 
  // conexão com o Supabase seja criada apenas uma vez e não se perca na navegação.
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  useEffect(() => {
    // 1. Verifica o usuário atual assim que a página carrega
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkUser()

    // 2. Escuta mudanças na sessão em tempo real ao navegar entre páginas
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
    router.push('/')
  }

  return (
    <header className="w-full bg-neutral-900 border-b border-neutral-800 py-4 px-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-black text-orange-500 uppercase tracking-wider">
          RotaBase
        </span>
      </Link>

      <nav className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium text-neutral-300 hover:text-orange-500 transition">
          Passeios
        </Link>

        {loading ? (
          <div className="h-9 w-20 bg-neutral-800 animate-pulse rounded-xl" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-2 px-4 rounded-xl border border-neutral-700 transition"
            >
              Meu Painel
            </Link>
            <button
              onClick={handleSignOut}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold py-2 px-3 rounded-xl border border-red-500/30 transition"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-xs font-bold text-neutral-300 hover:text-white py-2 px-3 transition"
            >
              Entrar
            </Link>
            <Link
              href="/auth/cadastro"
              className="bg-orange-500 hover:bg-orange-600 text-black text-xs font-black py-2 px-4 rounded-xl transition shadow-lg shadow-orange-500/20 uppercase tracking-wider"
            >
              Criar Conta
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
