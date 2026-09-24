'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Trash2, Plus, Users } from 'lucide-react';

export default function GuiasEmpresa() {
  const supabase = createBrowserClient();
  const [guias, setGuias] = useState<any[]>([]);
  const [novoGuiaId, setNovoGuiaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState('');

  useEffect(() => {
    carregarGuias();
  }, []);

  async function carregarGuias() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmpresaId(user.id);

    // Busca os guias ligados a esta empresa especificando a chave estrangeira correta
    const { data, error } = await supabase
      .from('company_guides')
      .select(`
        guide_id,
        created_at,
        guia_info:users!company_guides_guide_id_fkey (
          full_name,
          email
        )
      `)
      .eq('company_id', user.id);

    if (data) setGuias(data);
    setLoading(false);
  }

  async function adicionarGuia(e: React.FormEvent) {
    e.preventDefault();
    if (!novoGuiaId.trim()) return;

    const { error } = await supabase
      .from('company_guides')
      .insert({ company_id: empresaId, guide_id: novoGuiaId.trim() });

    if (error) {
      alert('Erro ao adicionar guia. Verifica se o ID está correto ou se este guia já está na tua equipa.');
    } else {
      setNovoGuiaId('');
      carregarGuias();
    }
  }

  async function removerGuia(guideId: string) {
    if (!confirm('Tens a certeza que queres remover este guia da tua agência? Ele perderá o acesso aos passeios da empresa.')) return;

    const { error } = await supabase
      .from('company_guides')
      .delete()
      .eq('company_id', empresaId)
      .eq('guide_id', guideId);

    if (!error) carregarGuias();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-amber-500" /> Meus Guias
        </h1>
        <p className="text-stone-500 mt-2">Gere a tua equipa. Pede ao guia o seu ID de registo e adiciona-o aqui.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-stone-800 mb-4">Adicionar Novo Guia</h2>
        <form onSubmit={adicionarGuia} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Cola aqui o ID do Guia..."
            value={novoGuiaId}
            onChange={(e) => setNovoGuiaId(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-stone-800"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Adicionar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-sm">
              <th className="p-4 font-semibold">Nome do Guia</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="p-8 text-center text-stone-500 animate-pulse">A carregar equipa...</td></tr>
            ) : guias.length === 0 ? (
              <tr><td colSpan={2} className="p-8 text-center text-stone-500">Ainda não tens nenhum guia na tua equipa.</td></tr>
            ) : (
              guias.map((ligacao) => {
                const guia = Array.isArray(ligacao.guia_info) ? ligacao.guia_info[0] : ligacao.guia_info;
                return (
                  <tr key={ligacao.guide_id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition">
                    <td className="p-4">
                      <p className="font-bold text-stone-800">{guia?.full_name || 'Guia (Nome não definido)'}</p>
                      <p className="text-sm text-stone-500">{guia?.email}</p>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => removerGuia(ligacao.guide_id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition inline-flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline font-semibold">Remover</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
