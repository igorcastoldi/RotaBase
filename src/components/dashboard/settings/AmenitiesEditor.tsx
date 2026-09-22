'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import type { AgencyAmenity } from '@/types/database';

interface Props {
  agencyId: string;
  initial: AgencyAmenity[];
}

/** Sugestões de ícones (nomes de ícones lucide-react) para orientar o usuário. */
const ICON_SUGGESTIONS = [
  'wifi',
  'coffee',
  'car',
  'shield',
  'camera',
  'utensils',
  'droplet',
  'sun',
  'map-pin',
  'life-buoy',
  'first-aid',
  'parking',
];

export default function AmenitiesEditor({ agencyId, initial }: Props) {
  const supabase = createBrowserClient();
  const [amenities, setAmenities] = useState<AgencyAmenity[]>(
    [...initial].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado do formulário de nova comodidade
  const [icon, setIcon] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      setError('Informe ao menos um nome para a comodidade.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const nextOrder =
        amenities.length > 0 ? Math.max(...amenities.map((a) => a.sort_order)) + 1 : 0;
      const { data, error: insertError } = await supabase
        .from('agency_amenities')
        .insert({
          agency_id: agencyId,
          icon: icon.trim() || 'check',
          label: label.trim(),
          description: description.trim() || null,
          is_active: true,
          sort_order: nextOrder,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setAmenities((prev) => [...prev, data as AgencyAmenity]);
      setIcon('');
      setLabel('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar comodidade.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('Remover esta comodidade?')) return;
    setSaving(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('agency_amenities')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      setAmenities((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover comodidade.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: AgencyAmenity) {
    setSaving(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('agency_amenities')
        .update({ is_active: !item.is_active })
        .eq('id', item.id);
      if (updateError) throw updateError;
      setAmenities((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, is_active: !a.is_active } : a))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar comodidade.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Comodidades</h3>
        <p className="text-sm text-gray-500">
          Cadastre os diferenciais e comodidades que aparecem no perfil público da sua agência.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Lista de comodidades cadastradas */}
      <ul className="space-y-2">
        {amenities.length === 0 && (
          <li className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
            Nenhuma comodidade cadastrada ainda.
          </li>
        )}
        {amenities.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <GripVertical className="h-4 w-4 shrink-0 text-gray-300" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{item.label}</span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                  {item.icon}
                </span>
                {!item.is_active && (
                  <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                    inativa
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-sm text-gray-500">{item.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggleActive(item)}
              disabled={saving}
              className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-50"
            >
              {item.is_active ? 'Desativar' : 'Ativar'}
            </button>
            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              disabled={saving}
              className="text-gray-400 hover:text-red-600 disabled:opacity-50"
              aria-label="Remover comodidade"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {/* Formulário de nova comodidade */}
      <form onSubmit={handleAdd} className="space-y-4 rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900">Adicionar comodidade</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nome *</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex.: Estacionamento gratuito"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ícone</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Ex.: car"
              list="amenity-icons"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <datalist id="amenity-icons">
              {ICON_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhe opcional da comodidade"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Adicionar
        </button>
      </form>
    </div>
  );
}
