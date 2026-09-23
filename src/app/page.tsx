import Link from 'next/link';
import { Mountain, Instagram, Facebook, Youtube } from 'lucide-react';
import { Hero } from '@/components/home/Hero';
import { TourShowcase } from '@/components/home/TourShowcase';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <SiteHeader />
      <main>
        <Hero />
        <TourShowcase />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500">
            <Mountain className="h-5 w-5 text-black" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Rota<span className="text-orange-500">Base</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-300 md:flex">
          <Link href="#passeios" className="transition hover:text-white">Passeios</Link>
          <Link href="/explorar" className="transition hover:text-white">Explorar</Link>
          <Link href="#passeios" className="transition hover:text-white">Destinos</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/explorar"
            className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:text-white sm:block"
          >
            Entrar
          </Link>
          <Link
            href="#passeios"
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-orange-400"
          >
            Reservar agora
          </Link>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500">
                <Mountain className="h-5 w-5 text-black" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                Rota<span className="text-orange-500">Base</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-neutral-400">
              O marketplace que conecta você aos melhores passeios off-road do Brasil, com segurança e operadores
              verificados.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <FooterCol title="Explorar" links={['Passeios', 'Destinos', 'Operadores']} />
            <FooterCol title="Empresa" links={['Sobre nós', 'Segurança', 'Contato']} />
            <FooterCol title="Suporte" links={['Central de ajuda', 'Cancelamentos', 'Termos']} />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-neutral-500">© {new Date().getFullYear()} RotaBase. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3 text-neutral-400">
            <Link href="#" aria-label="Instagram" className="transition hover:text-orange-400"><Instagram className="h-5 w-5" /></Link>
            <Link href="#" aria-label="Facebook" className="transition hover:text-orange-400"><Facebook className="h-5 w-5" /></Link>
            <Link href="#" aria-label="YouTube" className="transition hover:text-orange-400"><Youtube className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-bold text-white">{title}</h4>
      <ul className="mt-3 space-y-2 text-neutral-400">
        {links.map((l) => (
          <li key={l}>
            <Link href="#passeios" className="transition hover:text-orange-400">{l}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
