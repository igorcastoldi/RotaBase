import Link from 'next/link';
import { Mountain } from 'lucide-react';

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-stone-900">
            <Mountain className="w-6 h-6 text-amber-500" />
            RotaBase
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <Link href="/explorar" className="hover:text-amber-600 transition">Explorar</Link>
            <Link href="/sobre" className="hover:text-amber-600 transition">Sobre</Link>
            <Link href="/auth/login" className="hover:text-amber-600 transition">Entrar</Link>
            <Link href="/auth/cadastro" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition">
              Cadastrar
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="bg-stone-900 text-stone-400 py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center space-y-2">
          <p className="text-white font-bold flex items-center justify-center gap-2">
            <Mountain className="w-5 h-5 text-amber-500" /> RotaBase
          </p>
          <p className="text-sm">© {new Date().getFullYear()} RotaBase. Todos os direitos reservados.</p>
        </div>
      </footer>
    </>
  );
}
