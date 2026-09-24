'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Bike, Clock, Users, Tag, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function MeusPasseiosGuia() {
  const supabase = createBrowserClient();
  const [passeios, setPasseios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPasseios();
  }, []);

  async function carregarPasseios() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPasseios(data);
    }
    setLoading(false);
  }

  async function apagarPasseio(id: string) {
    if (!confirm('Tens a certeza que queres apagar este passeio?')) return;
    
    const { error } = await supabase
      .from('tours')
      .delete()
      .eq('id', id);

    if (!error) {
      carregarPasseios();
    } else {
      alert('Erro ao apagar: ' + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-50 flex items-center gap-3">
              <Bike className="w-8 h-8 text-orange-500" /> Meus Passeios
            </h1>
            <p className="text-gray-400 mt-1">Gerencie o seu catálogo de trilhas e aventuras.</p>
          </div>
          <Link 
            href="/dashboard/guia/passeios/novo"
            className="bg-orange-500 hover:bg-orange-400 text-gray-900 px-6 py-3 rounded-sm font-semibold flex items-center justify-center gap-2 transition whitespace-nowrap shadow-sm text-sm"
          >
            <Plus className="w-5 h-5" /> Adicionar Passeio
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse font-semibold">
            Carregando os seus passeios...
          </div>
        ) : passeios.length === 0 ? (
          <div className="bg-gray-900 rounded-sm border border-gray-800 border-dashed p-12 text-center flex flex-col items-center">
            <Bike className="w-16 h-16 text-gray-700 mb-4" />
            <h3 className="text-xl font-bold text-gray-200 mb-2">Nenhum passeio criado</h3>
            <p className="text-gray-400 mb-6 max-w-md text-sm">Você ainda não tem nenhum trajeto no seu catálogo. Comece a adicionar as suas trilhas para poder receber reservas.</p>
            <Link 
              href="/dashboard/guia/passeios/novo"
              className="bg-orange-500 hover:bg-orange-400 text-gray-900 px-6 py-3 rounded-sm font-semibold transition text-sm"
            >
              Criar o meu primeiro passeio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {passeios.map((passeio) => (
              <div key={passeio.id} className="bg-gray-900 rounded-sm border border-gray-800 overflow-hidden shadow-sm hover:border-gray-700 transition group">
                <div className="h-48 bg-gray-800 relative border-b border-gray-800 flex items-center justify-center">
                  <Bike className="w-12 h-12 text-gray-600" />
                  <button 
                    onClick={() => apagarPasseio(passeio.id)}
                    className="absolute top-3 right-3 bg-gray-900/90 hover:bg-red-500/20 text-gray-400 hover:text-red-400 p-2 rounded-sm opacity-0 group-hover:opacity-100 transition shadow-sm border border-gray-700"
                    title="Apagar passeio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-100 mb-4 line-clamp-2">{passeio.title}</h3>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-gray-300 gap-2">
                      <Tag className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-gray-100">
                        R$ {Number(passeio.price_per_person || passeio.price).toFixed(2).replace('.', ',')} / pes.
                      </span>
                    </div>
                    <div className="flex items-center text-gray-400 gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{passeio.duration} horas</span>
                    </div>
                    <div className="flex items-center text-gray-400 gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>Até {passeio.max_people} pessoas</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 line-clamp-2 border-t border-gray-800 pt-3">
                    {passeio.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
