import Link from 'next/link';
import { MapPin, Star, Users, ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 text-white py-28 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/hero-bg.jpg')] bg-cover bg-center" />
        <div className="relative max-w-3xl mx-auto space-y-6">
          <span className="inline-block bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-semibold px-4 py-1.5 rounded-full">
            🏍️ A maior plataforma de aventura off-road do Brasil
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Explore além<br />
            <span className="text-amber-400">das fronteiras</span>
          </h1>
          <p className="text-lg text-stone-300 max-w-xl mx-auto">
            Quadriciclos, UTVs e 4x4. Reserve seu passeio de aventura com as melhores agências do Brasil.
          </p>
          <Link href="/explorar"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg transition">
            Explorar Passeios <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: MapPin, title: 'Agências Verificadas', desc: 'Parceiros certificados com equipamentos revisados e guias treinados.' },
          { icon: Star, title: 'Avaliações Reais', desc: 'Comentários de clientes que realmente fizeram os passeios.' },
          { icon: Users, title: 'Grupos e Famílias', desc: 'Passeios para todos os perfis: duplas, grupos e famílias.' },
        ].map((f) => (
          <div key={f.title} className="card text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-2xl mb-1">
              <f.icon className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-bold text-stone-800 text-lg">{f.title}</h3>
            <p className="text-stone-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-amber-500 py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-extrabold mb-4">É dono de uma agência de aventura?</h2>
        <p className="text-amber-100 mb-8 max-w-lg mx-auto">
          Cadastre sua empresa na RotaBase e alcance milhares de aventureiros em todo o Brasil.
        </p>
        <Link href="/auth/cadastro"
          className="inline-block bg-white text-amber-600 font-bold px-8 py-3.5 rounded-2xl shadow hover:bg-amber-50 transition">
          Cadastrar Minha Agência
        </Link>
      </section>
    </main>
  );
}
