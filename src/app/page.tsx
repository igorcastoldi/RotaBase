'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Mountain, Instagram, Facebook, Youtube, Bike, Clock, Users, MapPin, Sparkles, Navigation } from 'lucide-react';
import { Hero } from '@/components/home/Hero';

// Função inteligente que corrige erros de digitação e unifica na região padrão oficial
function getRegiaoPadrao(local: string): string {
  if (!local) return 'Região Geral';
  const l = local.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  if (l.includes('bacupari')) return 'Lagoa do Bacupari';
  if (l.includes('guaratiba')) return 'Guaratiba';
  if (l.includes('mato grosso') || l === 'mt') return 'Mato Grosso';
  if (l.includes('serra') || l.includes('gaucha')) return 'Serra Gaúcha - RS';
  if (l.includes('jericoacoara') || l.includes('jeri')) return 'Jericoacoara - CE';
  if (l.includes('lençois') || l.includes('maranhenses')) return 'Lençóis Maranhenses - MA';
  if (l.includes('pantanal')) return 'Pantanal - MT';
  if (l.includes('amazonia')) return 'Amazônia - AM';

  // Capitaliza a primeira letra caso seja uma região nova
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export default function HomePage() {
  const supabase = createBrowserClient();
  const [passeios, setPasseios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState('Novos');

  useEffect(() => {
    carregarPasseiosPublicos();
  }, []);

  async function carregarPasseiosPublicos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPasseios(data);
    }
    setLoading(false);
  }

  // Verifica se o passeio foi criado nos últimos 7 dias (para a aba Novos)
  function ehPasseioNovo(createdAt: string) {
    if (!createdAt) return false;
    const umaSemanaMs = 7 * 24 * 60 * 60 * 1000;
    const diferenca = new Date().getTime() - new Date(createdAt).getTime();
    return diferenca <= umaSemanaMs;
  }

  // Extrai e padroniza dinamicamente todas as regiões cadastradas
  const regioesDinamicas = Array.from(
    new Set(passeios.map(p => getRegiaoPadrao(p.location)).filter(Boolean))
  );

  // Filtra os passeios de acordo com a aba ativa
  const passeiosFiltrados = passeios.filter(passeio => {
    const regiaoPadronizada = getRegiaoPadrao(passeio.location);
    if (filtroAtivo === 'Novos') {
      return ehPasseioNovo(passeio.created_at);
    }
    if (filtroAtivo === 'Todas as regiões') {
      return true;
    }
    return regiaoPadronizada === filtroAtivo;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <main>
        <Hero />

        {/* Seção de Vitrine de Passeios com Correção Automática e Waze */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
              Vitrine de Aventuras
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
              Escolha seu destino e caia na trilha
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Selecione uma categoria ou região para ver os passeios de quadriciclo, UTV e 4×4 disponíveis com operadores verificados.
            </p>
          </div>

          {/* Abas de Filtro (Novos + Regiões Padronizadas Automaticamente) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none justify-start sm:justify-center">
            <button
              onClick={() => setFiltroAtivo('Novos')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${
                filtroAtivo === 'Novos'
                  ? 'bg-orange-500 text-neutral-950 shadow-lg shadow-orange-500/20 font-bold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Novos
            </button>

            <button
              onClick={() => setFiltroAtivo('Todas as regiões')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                filtroAtivo === 'Todas as regiões'
                  ? 'bg-orange-500 text-neutral-950 shadow-lg shadow-orange-500/20 font-bold'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              Todas as regiões
            </button>

            {regioesDinamicas.map((regiao) => (
              <button
                key={regiao}
                onClick={() => setFiltroAtivo(regiao)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                  filtroAtivo === regiao
                    ? 'bg-orange-500 text-neutral-950 shadow-lg shadow-orange-500/20 font-bold'
                    : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {regiao}
              </button>
            ))}
          </div>

          {/* Lista de Passeios */}
          {loading ? (
            <div className="text-center py-20 text-neutral-500 animate-pulse font-semibold">
              Carregando passeios disponíveis...
            </div>
          ) : passeiosFiltrados.length === 0 ? (
            <div className="bg-neutral-900 rounded-sm border border-neutral-800 border-dashed p-12 text-center flex flex-col items-center max-w-md mx-auto">
              <Bike className="w-16 h-16 text-neutral-700 mb-4" />
              <h3 className="text-xl font-bold text-neutral-200 mb-2">Nenhum passeio nesta aba</h3>
              <p className="text-neutral-400 text-sm mb-6">Não encontramos nenhum trajeto recente ou nesta região no momento.</p>
              <button
                onClick={() => setFiltroAtivo('Todas as regiões')}
                className="bg-orange-500 hover:bg-orange-400 text-neutral-950 px-6 py-2.5 rounded-sm font-semibold transition text-sm"
              >
                Ver todas as regiões
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {passeiosFiltrados.map((passeio) => {
                const regiaoOficial = getRegiaoPadrao(passeio.location);
                const operadorNome = passeio.operator_name || 'Operador Verificado';
                const wazeUrl = `https://www.waze.com/ul?q=${encodeURIComponent(passeio.location || 'Trilha Off-Road')}`;

                return (
                  <div key={passeio.id} className="bg-neutral-900 rounded-sm border border-neutral-800 overflow-hidden shadow-sm hover:border-neutral-700 transition flex flex-col">
                    <div className="h-48 bg-neutral-800 relative border-b border-neutral-800 flex items-center justify-center overflow-hidden">
                      {passeio.image_url ? (
                        <img src={passeio.image_url} alt={passeio.title} className="w-full h-full object-cover" />
                      ) : (
                        <Bike className="w-12 h-12 text-neutral-600" />
                      )}
                      <span className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-sm text-orange-400 text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider border border-neutral-800">
                        Quadriciclo / UTV
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Nome da Empresa Responsável */}
                        <div className="mb-2">
                          <span className="text-xs text-neutral-400">Operado por: <strong className="text-orange-400 font-semibold">{operadorNome}</strong></span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{passeio.title}</h3>
                        
                        {/* Região Padronizada Automaticamente + Botão Waze */}
                        <div className="flex items-center justify-between mb-4 gap-2">
                          <p className="text-xs text-orange-400 flex items-center gap-1 font-medium bg-orange-500/10 px-2.5 py-1 rounded border border-orange-500/20 truncate">
                            <MapPin className="w-3.5 h-3.5 shrink-0" /> {regiaoOficial}
                          </p>
                          <a
                            href={wazeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-1 rounded transition font-medium shrink-0"
                            title="Abrir rota exata no Waze"
                          >
                            <Navigation className="w-3.5 h-3.5" /> Waze
                          </a>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-400 mb-4">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-neutral-500" />
                            {passeio.duration}h
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-neutral-500" />
                            Até {passeio.max_people} pessoas
                          </span>
                        </div>

                        <p className="text-sm text-neutral-400 line-clamp-2 border-t border-neutral-800 pt-3 mb-4">
                          {passeio.description}
                        </p>
                      </div>

                      <div className="border-t border-neutral-800 pt-4 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-neutral-500">A partir de</p>
                          <p className="text-lg font-black text-orange-500">
                            R$ {Number(passeio.price_per_person || passeio.price).toFixed(2).replace('.', ',')}
                            <span className="text-xs text-neutral-400 font-normal"> / pessoa</span>
                          </p>
                        </div>
                        <button className="bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold px-4 py-2.5 rounded-sm text-sm transition">
                          Agendar Passeio
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
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
