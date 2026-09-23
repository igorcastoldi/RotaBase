import Link from 'next/link';
import { MountainSnow, ShieldCheck, Star } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/tours/hero.png" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-neutral-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-300 backdrop-blur-sm">
            <MountainSnow className="h-3.5 w-3.5" />
            O marketplace da aventura off-road
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Trilhas, dunas e adrenalina
            <span className="block text-orange-500">a um clique de você</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-neutral-300">
            Encontre e agende passeios de quadriciclo, UTV e 4x4 com operadores verificados nos destinos mais
            incríveis do Brasil.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#passeios"
              className="rounded-xl bg-orange-500 px-7 py-3.5 text-base font-bold text-black transition hover:bg-orange-400"
            >
              Explorar passeios
            </Link>
            <Link
              href="/explorar"
              className="rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Sou operador
            </Link>
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
            <Stat icon={<Star className="h-4 w-4 text-orange-400" />} value="4.9/5" label="avaliação média" />
            <Stat icon={<ShieldCheck className="h-4 w-4 text-orange-400" />} value="120+" label="operadores verificados" />
            <Stat icon={<MountainSnow className="h-4 w-4 text-orange-400" />} value="35" label="destinos no Brasil" />
          </dl>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="flex items-center gap-2 text-2xl font-extrabold text-white">
        {icon}
        {value}
      </dd>
      <span className="text-sm text-neutral-400">{label}</span>
    </div>
  );
}
