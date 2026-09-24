'use client';
import React, { useState, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Bike, Clock, Users, UploadCloud, ImageIcon, Tag, CheckCircle2 } from 'lucide-react';

const Field = ({ label, error, children, hint }: any) => (
  <div>
    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">{label}</label>
    {children}
    <div className="mt-1 flex justify-between">
      <span className="text-xs text-red-400">{error || ''}</span>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  </div>
);

export default function NovoPasseio() {
  const supabase = createBrowserClient();
  const [nome, setNome] = useState('');
  const [precoPorPessoa, setPrecoPorPessoa] = useState('');
  const [duracao, setDuracao] = useState('');
  const [unidadeDuracao, setUnidadeDuracao] = useState('horas');
  const [lotacao, setLotacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState<{ url: string; name: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DESC_LIMIT = 300;

  function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setImagem({ url: e.target?.result as string, name: file.name });
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!nome.trim()) errs.nome = 'Informe o nome do passeio.';
    if (!precoPorPessoa || Number(precoPorPessoa) <= 0) errs.precoPorPessoa = 'Informe um preço válido.';
    if (!duracao || Number(duracao) <= 0) errs.duracao = 'Informe a duração.';
    if (!lotacao || Number(lotacao) <= 0) errs.lotacao = 'Informe a lotação máxima.';
    if (!descricao.trim()) errs.descricao = 'Descreva o trajeto do passeio.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Sessão expirada. Faz login novamente.');

    let horasSalvas = 0;
    let minutosSalvos = 0;

    if (unidadeDuracao === 'horas') {
      horasSalvas = parseFloat(duracao);
      minutosSalvos = Math.round(horasSalvas * 60);
    } else {
      minutosSalvos = parseInt(duracao);
      horasSalvas = Number((minutosSalvos / 60).toFixed(1));
    }

    const precoUnitario = parseFloat(precoPorPessoa);
    const maxPessoas = parseInt(lotacao);
    const receitaTotalPotencial = precoUnitario * maxPessoas;

    // Enviar para o Supabase gravando o preço por pessoa e o preço total calculado
    const { error } = await supabase.from('tours').insert({
      title: nome,
      price: receitaTotalPotencial,         // Preço total para compatibilidade com a lista
      price_per_person: precoUnitario,    // Preço exato por pessoa
      duration: horasSalvas,
      duration_minutes: minutosSalvos,
      max_people: maxPessoas,
      description: descricao,
      created_by: user.id
    });

    if (error) {
      alert(`Erro ao salvar: ${error.message}`);
      return;
    }

    setToast(true);
    setTimeout(() => setToast(false), 3000);
    handleReset();
  }

  function handleReset() {
    setNome(''); setPrecoPorPessoa(''); setDuracao(''); setLotacao(''); setDescricao('');
    setUnidadeDuracao('horas');
    setImagem(null); setErrors({});
  }

  const inputBase = "w-full bg-gray-800 border text-gray-100 placeholder-gray-500 px-4 py-2.5 text-sm rounded-sm focus:outline-none focus:ring-1 transition-colors";
  const inputOk = "border-gray-700 focus:border-orange-500 focus:ring-orange-500";
  const inputErr = "border-red-500 focus:border-red-500 focus:ring-red-500";

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-500 rounded-sm flex items-center justify-center">
            <Bike className="w-5 h-5 text-gray-900" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-500">Meu Painel &middot; Criar</p>
            <h1 className="text-2xl font-bold tracking-tight text-gray-50">Adicionar Passeio de Quadriciclo/UTV</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-sm p-6 sm:p-8 space-y-6">
            <Field label="Nome do Passeio" error={errors.nome}>
              <input
                className={`${inputBase} ${errors.nome ? inputErr : inputOk}`}
                placeholder="Ex: Trilha Serra do Cipó ao Pôr do Sol"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Preço por Pessoa (R$)" error={errors.precoPorPessoa}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`${inputBase} pl-9 ${errors.precoPorPessoa ? inputErr : inputOk}`}
                    placeholder="120,00"
                    value={precoPorPessoa}
                    onChange={(e) => setPrecoPorPessoa(e.target.value)}
                  />
                </div>
              </Field>

              <Field label="Duração" error={errors.duracao}>
                <div className="flex">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={`${inputBase} rounded-r-none border-r-0 focus:z-10 ${errors.duracao ? inputErr : inputOk}`}
                    placeholder="Ex: 2"
                    value={duracao}
                    onChange={(e) => setDuracao(e.target.value)}
                  />
                  <select
                    value={unidadeDuracao}
                    onChange={(e) => setUnidadeDuracao(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-gray-300 px-2 py-2.5 text-sm rounded-r-sm focus:outline-none focus:ring-1 focus:border-orange-500 focus:ring-orange-500"
                  >
                    <option value="horas">Horas</option>
                    <option value="minutos">Min.</option>
                  </select>
                </div>
              </Field>

              <Field label="Lotação Máxima" error={errors.lotacao}>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={`${inputBase} pr-10 ${errors.lotacao ? inputErr : inputOk}`}
                    placeholder="10"
                    value={lotacao}
                    onChange={(e) => setLotacao(e.target.value)}
                  />
                  <Users className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </Field>
            </div>

            <Field label="Descrição do Trajeto" error={errors.descricao} hint={`${descricao.length}/${DESC_LIMIT}`}>
              <textarea
                rows={5}
                maxLength={DESC_LIMIT}
                className={`${inputBase} resize-none ${errors.descricao ? inputErr : inputOk}`}
                placeholder="Descreva o percurso, pontos de parada, nível de dificuldade..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </Field>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Imagem do Passeio</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-orange-500 bg-orange-500/5' : 'border-gray-700 hover:border-gray-600'}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                {imagem ? (
                  <div className="flex items-center gap-4">
                    <img src={imagem.url} alt="Prévia" className="w-20 h-20 object-cover rounded-sm border border-gray-700" />
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{imagem.name}</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImagem(null); }}
                        className="text-xs text-red-400 hover:text-red-300 mt-1"
                      >
                        Remover imagem
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center">
                    <UploadCloud className="w-8 h-8 text-orange-500 mb-3" />
                    <p className="text-sm text-gray-300">Arraste uma imagem aqui ou <span className="text-orange-500">clique para enviar</span></p>
                    <p className="text-xs text-gray-500 mt-1">Apenas pré-visualização visual por agora.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-400 text-gray-900 font-semibold text-sm py-3 rounded-sm transition-colors"
              >
                Salvar Passeio
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 text-sm rounded-sm transition-colors"
              >
                Limpar
              </button>
            </div>
          </form>

          {/* Live preview */}
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Pré-visualização</p>
            <div className="bg-gray-900 border border-gray-800 rounded-sm overflow-hidden sticky top-6">
              <div className="h-44 bg-gray-800 flex items-center justify-center overflow-hidden">
                {imagem ? (
                  <img src={imagem.url} alt="Imagem do passeio" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-600" />
                )}
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-gray-50 text-balance">{nome || 'Nome do passeio'}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  <span className="flex items-center gap-1.5 text-orange-500 font-semibold tabular-nums">
                    <Tag className="w-3.5 h-3.5" />
                    {precoPorPessoa ? `R$ ${Number(precoPorPessoa).toFixed(2).replace('.', ',')} / pes.` : 'R$ --'}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400 tabular-nums">
                    <Clock className="w-3.5 h-3.5" />
                    {duracao ? `${duracao} ${unidadeDuracao === 'horas' ? 'h' : 'min'}` : '--'}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400 tabular-nums">
                    <Users className="w-3.5 h-3.5" />
                    {lotacao ? `até ${lotacao} pessoas` : '-- pessoas'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed text-pretty border-t border-gray-800 pt-3">
                  {descricao || 'A descrição do trajeto aparecerá aqui conforme você preenche o formulário.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 border border-orange-500 text-gray-100 px-5 py-3 rounded-sm flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-orange-500" />
          Passeio salvo com sucesso!
        </div>
      )}
    </div>
  );
}
