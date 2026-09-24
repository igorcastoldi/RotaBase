'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Bike, Clock, Users, Tag, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomeMarketplace() {
  const supabase = createBrowserClient();
  const [passeios, setPasseios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState('Novos'); // Começa na aba Novos por padrão

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

  // Função inteligente para unificar variações de nomes de regiões
  function regiaoCombina(localPasseio: string, abaSelecionada: string) {
    if (abaSelecionada === 'Todas as regiões') return true;
    if (!localPasseio) return false;

    const normalizar = (str: string) => 
      str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    const loc = normalizar(localPasseio);
    const aba = normalizar(abaSelecionada);

    return aba.split(' ').some(palavra => palavra.length > 3 && loc.includes(palavra));
  }

  // Verifica se o passeio foi criado nos últimos 7 dias (para a aba Novos)
  function ehPasseioNovo(createdAt: string) {
    if (!createdAt) return false;
    const umaSemanaMs = 7 * 24 * 60 * 60 * 1000;
    const diferenca = new Date().getTime() - new Date(createdAt).getTime();
    return diferenca <= umaSemanaMs;
  }

  // Extrai as regiões únicas cadastradas para criar as abas automaticamente
  const regioesDinamicas = Array.from(new Set(passeios.map(p => p.location).filter(Boolean)));

  // Filtra os passeios de acordo com a aba ativa
  const passeiosFiltrados = passeios.filter(passeio => {
    if (filtroAtivo === 'Novos') {
      return ehPasseioNovo(passeio.created_at);
    }
    return regiaoCombina(passeio.location, filtroAtivo);
  });

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-100">
      {/* Mantém exatamente a estrutura visual original da sua home */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
            Vitrine de Aventuras
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-50 mb-4 tracking-tight">
            Escolha seu destino e caia na trilha
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Selecione uma categoria ou região para ver os passeios de quadriciclo, UTV e 4×4 disponíveis com operadores verificados.
          </p>
        </div>

        {/* Abas de Filtro com a aba Novos e Regiões Automáticas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none justify-start sm:justify-center">
          <button
            onClick={() => setFiltroAtivo('Novos')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition whitespace-nowrap flex items-center gap-2 ${
              filtroAtivo === 'Novos'
                ? 'bg-orange-500 text-gray-950 shadow-lg shadow-orange-500/20'
                : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Novos
          </button>

          <button
            onClick={() => setFiltroAtivo('Todas as regiões')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition whitespace-nowrap ${
              filtroAtivo === 'Todas as regiões'
                ? 'bg-orange-500 text-gray-950 shadow-lg shadow-orange-500/20'
                : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
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
                  ? 'bg-orange-500 text-gray-950 shadow-lg shadow-orange-500/20'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {regiao}
            </button>
          ))}
        </div>

        {/* Lista de Passeios */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse font-semibold">
            Carregando passeios disponíveis...
          </div>
        ) : passeiosFiltrados.length === 0 ? (
          <div className="bg-gray-900 rounded-sm border border-gray-800 border-dashed p-12 text-center flex flex-col items-center max-w-md mx-auto">
            <Bike className="w-16 h-16 text-gray-700 mb-4" />
            <h3 className="text-xl font-bold text-gray-200 mb-2">Nenhum passeio nesta aba</h3>
            <p className="text-gray-400 text-sm mb-6">Não encontramos nenhum trajeto recente ou nesta região no momento.</p>
            <button
              onClick={() => setFiltroAtivo('Todas as regiões')}
              className="bg-orange-500 hover:bg-orange-400 text-gray-950 px-6 py-2.5 rounded-sm font-semibold transition text-sm"
            >
              Ver todas as regiões
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {passeiosFiltrados.map((passeio) => (
              <div key={passeio.id} className="bg-gray-900 rounded-sm border border-gray-800 overflow-hidden shadow-sm hover:border-gray-700 transition flex flex-col">
                <div className="h-48 bg-gray-800 relative border-b border-gray-800 flex items-center justify-center overflow-hidden">
                  {passeio.image_url ? (
                    <img src={passeio.image_url} alt={passeio.title} className="w-full h-full object-cover" />
                  ) : (
                    <Bike className="w-12 h-12 text-gray-600" />
                  )}
                  <span className="absolute top-3 left-3 bg-gray-950/80 backdrop-blur-sm text-orange-400 text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider border border-gray-800">
                    Quadriciclo / UTV
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-100 mb-1 line-clamp-2">{passeio.title}</h3>
                    {passeio.location && (
                      <p className="text-xs text-orange-400 flex items-center gap-1 font-medium mb-4">
                        <MapPin className="w-3.5 h-3.5" /> {passeio.location}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {passeio.duration}h
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-500" />
                        Até {passeio.max_people} pessoas
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2 border-t border-gray-800 pt-3 mb-4">
                      {passeio.description}
                    </p>
                  </div>

                  <div className="border-t border-gray-800 pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500">A partir de</p>
                      <p className="text-lg font-black text-orange-500">
                        R$ {Number(passeio.price_per_person || passeio.price).toFixed(2).replace('.', ',')}
                        <span className="text-xs text-gray-400 font-normal"> / pessoa</span>
                      </p>
                    </div>
                    <button className="bg-orange-500 hover:bg-orange-400 text-gray-950 font-bold px-4 py-2.5 rounded-sm text-sm transition">
                      Agendar Passeio
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
