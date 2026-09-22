'use client';
import { useState } from 'react';
import { updateWhatsAppSettings } from '@/actions/agency.actions';
import { Loader2, MessageCircle } from 'lucide-react';
import type { Agency } from '@/types/database';

export default function WhatsAppSettings({ agency }: { agency: Agency }) {
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState(agency.whatsapp_api_provider ?? 'none');
  const [apiUrl, setApiUrl] = useState(agency.whatsapp_api_url ?? '');
  const [instance, setInstance] = useState(agency.whatsapp_instance ?? '');
  const [notifyGuide, setNotifyGuide] = useState(agency.notify_guide);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateWhatsAppSettings(agency.id, {
        whatsapp_api_provider: provider,
        whatsapp_api_url: apiUrl,
        whatsapp_instance: instance,
        notify_guide: notifyGuide,
      });
      alert('Configurações de WhatsApp salvas!');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-lg">
      <div className="flex items-center gap-2 text-stone-800 font-semibold">
        <MessageCircle className="w-5 h-5 text-green-500" />
        Notificações Automáticas via WhatsApp
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Provedor de WhatsApp</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'none', label: 'Desativado' },
            { value: 'evolution', label: 'Evolution API' },
            { value: 'zapi', label: 'Z-API' },
          ] as const).map((opt) => (
            <button key={opt.value} type="button" onClick={() => setProvider(opt.value)}
              className={`py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                provider === opt.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-stone-200 text-stone-600 hover:border-stone-300'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {provider !== 'none' && (
        <>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">URL da API</label>
            <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="input-base"
              placeholder={provider === 'evolution' ? 'https://api.seudominio.com' : 'https://api.z-api.io'} />
          </div>
          {provider === 'evolution' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Nome da Instância</label>
              <input value={instance} onChange={(e) => setInstance(e.target.value)} className="input-base"
                placeholder="minha-agencia" />
            </div>
          )}
          <div>
            <p className="text-stone-500 text-sm">
              ⚠️ A chave de API (token) deve ser configurada via variável de ambiente no servidor ({provider === 'evolution' ? 'EVOLUTION_API_KEY' : 'ZAPI_TOKEN'}).
            </p>
          </div>
        </>
      )}

      {/* Notificar guia */}
      <label className="flex items-start gap-3 cursor-pointer bg-stone-50 rounded-2xl p-4 border border-stone-200">
        <input type="checkbox" checked={notifyGuide} onChange={(e) => setNotifyGuide(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-green-500" />
        <div>
          <p className="font-medium text-stone-800">Notificar Guia em nova reserva</p>
          <p className="text-stone-500 text-sm">O guia designado ao lote receberá um WhatsApp quando houver nova reserva.</p>
        </div>
      </label>

      <button type="submit" disabled={saving}
        className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl transition disabled:opacity-60 flex items-center gap-2">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Configurações'}
      </button>
    </form>
  );
}
