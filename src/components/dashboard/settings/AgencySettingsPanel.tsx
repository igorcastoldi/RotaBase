'use client';
import { useState } from 'react';
import { updateAgencySettings } from '@/actions/agency.actions';
import PaymentSettings from './PaymentSettings';
import WhatsAppSettings from './WhatsAppSettings';
import AmenitiesEditor from './AmenitiesEditor';
import { Building2, CreditCard, MessageCircle, Star, Loader2 } from 'lucide-react';
import type { Agency, AgencyAmenity } from '@/types/database';

type Tab = 'perfil' | 'pagamento' | 'whatsapp' | 'comodidades';

interface Props {
  agency: Agency;
  amenities: AgencyAmenity[];
}

export default function AgencySettingsPanel({ agency, amenities }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('perfil');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: agency.name,
    description: agency.description ?? '',
    local_curiosities: agency.local_curiosities ?? '',
    hq_name: agency.hq_name ?? '',
    hq_address: agency.hq_address ?? '',
    hq_lat: agency.hq_lat?.toString() ?? '',
    hq_lng: agency.hq_lng?.toString() ?? '',
    hq_google_maps_url: agency.hq_google_maps_url ?? '',
    hq_waze_url: agency.hq_waze_url ?? '',
    hq_whatsapp_number: agency.hq_whatsapp_number ?? '',
  });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'perfil', label: 'Perfil & Sede', icon: <Building2 className="w-4 h-4" /> },
    { id: 'pagamento', label: 'Pagamento', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'comodidades', label: 'Comodidades', icon: <Star className="w-4 h-4" /> },
  ];

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAgencySettings(agency.id, {
        ...form,
        hq_lat: form.hq_lat ? parseFloat(form.hq_lat) : null,
        hq_lng: form.hq_lng ? parseFloat(form.hq_lng) : null,
      });
      alert('Configurações salvas com sucesso!');
    } catch {
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-stone-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap px-5 py-3.5 text-sm font-medium transition border-b-2 ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Tab: Perfil & Sede */}
        {activeTab === 'perfil' && (
          <form onSubmit={handleSaveProfile} className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Nome da Empresa</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-base" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">História da Empresa</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4} className="input-base" placeholder="Conte a história da sua empresa..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Curiosidades Locais</label>
              <textarea value={form.local_curiosities} onChange={(e) => setForm({ ...form, local_curiosities: e.target.value })}
                rows={3} className="input-base" placeholder="Curiosidades sobre a região, dunas, fauna..." />
            </div>

            <hr className="border-stone-100" />
            <h3 className="font-semibold text-stone-800">Sede / Ponto de Partida</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome da Sede</label>
                <input value={form.hq_name} onChange={(e) => setForm({ ...form, hq_name: e.target.value })}
                  className="input-base" placeholder="Ex: Sede Além das Dunas" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">Endereço Completo</label>
                <input value={form.hq_address} onChange={(e) => setForm({ ...form, hq_address: e.target.value })}
                  className="input-base" placeholder="Rua, número, bairro, cidade" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Latitude</label>
                <input type="number" step="any" value={form.hq_lat} onChange={(e) => setForm({ ...form, hq_lat: e.target.value })}
                  className="input-base" placeholder="-3.732..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Longitude</label>
                <input type="number" step="any" value={form.hq_lng} onChange={(e) => setForm({ ...form, hq_lng: e.target.value })}
                  className="input-base" placeholder="-38.512..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Link Google Maps</label>
                <input value={form.hq_google_maps_url} onChange={(e) => setForm({ ...form, hq_google_maps_url: e.target.value })}
                  className="input-base" placeholder="https://maps.google.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Link Waze</label>
                <input value={form.hq_waze_url} onChange={(e) => setForm({ ...form, hq_waze_url: e.target.value })}
                  className="input-base" placeholder="https://waze.com/ul?..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp do Proprietário</label>
                <input value={form.hq_whatsapp_number} onChange={(e) => setForm({ ...form, hq_whatsapp_number: e.target.value })}
                  className="input-base" placeholder="5585999999999" />
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl transition disabled:opacity-60 flex items-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Alterações'}
            </button>
          </form>
        )}

        {activeTab === 'pagamento' && <PaymentSettings agency={agency} />}
        {activeTab === 'whatsapp' && <WhatsAppSettings agency={agency} />}
        {activeTab === 'comodidades' && <AmenitiesEditor agencyId={agency.id} initial={amenities} />}
      </div>
    </div>
  );
}
