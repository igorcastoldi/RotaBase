'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // 1. Verifica se já existe um usuário logado ao carregar a Home
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkUser()

    // 2. Escuta alterações na sessão (login/logout) em tempo real
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
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Cabeçalho da Home Sincronizado */}
      <header className="w-full border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black text-orange-500 uppercase tracking-wider">
            RotaBase
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
          <Link href="/" className="hover:text-orange-500 transition">Passeios</Link>
          <Link href="/explorar" className="hover:text-orange-500 transition">Explorar</Link>
          <Link href="/destinos" className="hover:text-orange-500 transition">Destinos</Link>
        </nav>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-24 bg-neutral-800 animate-pulse rounded-xl" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/cliente"
                className="bg-orange-500 hover:bg-orange-600 text-black text-xs font-black py-2.5 px-4 rounded-xl transition uppercase tracking-wider shadow-lg shadow-orange-500/20"
              >
                Meu Painel
              </Link>
              <button
                onClick={handleSignOut}
                className="text-xs font-bold text-neutral-400 hover:text-red-400 py-2 px-3 transition"
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
                className="bg-orange-500 hover:bg-orange-600 text-black text-xs font-black py-2.5 px-4 rounded-xl transition shadow-lg shadow-orange-500/20 uppercase tracking-wider"
              >
                Reservar agora
              </Link>
            </div>
          )}
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
