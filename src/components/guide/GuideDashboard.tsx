'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import PassengerList from './PassengerList';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Wifi, WifiOff, RefreshCw, CalendarDays, Copy, Check, Building2, LogOut } from 'lucide-react';
import type { Booking, TourSchedule } from '@/types/database';

export default function GuideDashboard({ guideId }: { guideId: string }) {
  const supabase = createBrowserClient();
  const { isOnline, lastSync, syncToLocal } = useOfflineSync();
  const [schedules, setSchedules] = useState<(TourSchedule & { bookings: Booking[]; tour_title: string })[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [linkedCompany, setLinkedCompany] = useState<{ id: string, name: string } | null>(null);

  async function loadData() {
    setLoading(true);
    
    // 1. Carregar a ligação com a empresa
    const { data: linkData } = await supabase
      .from('company_guides')
      .select(`
        company_id,
        empresa:users!company_guides_company_id_fkey(full_name)
      `)
      .eq('guide_id', guideId)
      .single();

    if (linkData) {
      const empresaInfo = Array.isArray(linkData.empresa) ? linkData.empresa[0] : linkData.empresa;
      setLinkedCompany({ id: linkData.company_id, name: empresaInfo?.full_name || 'Agência' });
    } else {
      setLinkedCompany(null);
    }

    // 2. Carregar os passeios do dia
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('tour_schedules')
      .select(`
        *,
        tour:tours(title),
        bookings(
          *,
          client:users(full_name, phone),
          waivers(status, signer_name)
        )
      `)
      .eq('guide_id', guideId)
      .eq('schedule_date', today)
      .order('start_time');

    if (data) {
      const mapped = data.map((s: any) => ({
        ...s,
        tour_title: s.tour?.title ?? 'Passeio',
        bookings: s.bookings ?? [],
      }));
      setSchedules(mapped);
      await syncToLocal('guide_schedules', mapped);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function copyId() {
    navigator.clipboard.writeText(guideId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSairEmpresa() {
    if (!confirm('Tens a certeza que queres sair desta agência? Vais perder o acesso aos passeios dela.')) return;
    
    const { error } = await supabase
      .from('company_guides')
      .delete()
      .eq('guide_id', guideId);

    if (!error) {
      setLinkedCompany(null);
      loadData();
    }
  }

  const currentSchedule = schedules.find((s) => s.id === selectedSchedule);

  return (
    <div className="min-h-screen bg-stone-900 text-white px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Painel do Guia</h1>
          <p className="text-stone-400 text-sm">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <span className="flex items-center gap-1 text-green-400 text-xs"><Wifi className="w-4 h-4" /> Online</span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 text-xs"><WifiOff className="w-4 h-4" /> Offline</span>
          )}
          <button onClick={loadData} disabled={!isOnline} className="text-stone-400 hover:text-white transition disabled:opacity-40">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {lastSync && (
        <p className="text-xs text-stone-500">
          Última sincronização: {new Date(lastSync).toLocaleTimeString('pt-BR')}
        </p>
      )}

      {/* Cartão de Vínculo e ID */}
      {!selectedSchedule && (
        <div className="bg-stone-800 border border-stone-700 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-stone-400 text-xs uppercase tracking-wider font-bold mb-1">O Teu ID de Guia</p>
              <code className="text-amber-500 font-mono text-sm bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800 break-all">
                {guideId}
              </code>
            </div>
            <button
              onClick={copyId}
              className="flex items-center justify-center gap-2 bg-stone-700 hover:bg-stone-600 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar ID'}
            </button>
          </div>

          <div className="pt-4 border-t border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-stone-900 flex items-center justify-center border border-stone-700">
                <Building2 className="w-5 h-5 text-stone-400" />
              </div>
              <div>
                <p className="text-stone-400 text-xs uppercase tracking-wider font-bold">Agência Atual</p>
                {linkedCompany ? (
                  <p className="font-bold text-white">{linkedCompany.name}</p>
                ) : (
                  <p className="text-stone-500 italic text-sm">Não estás vinculado a nenhuma agência.</p>
                )}
              </div>
            </div>
            
            {linkedCompany && (
              <button
                onClick={handleSairEmpresa}
                className="flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" /> Sair da Agência
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista de passeios do dia */}
      {!selectedSchedule ? (
        <div className="space-y-3">
          <h2 className="font-semibold text-stone-300 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Grupos de Hoje
          </h2>
          {loading ? (
            <div className="text-center py-8 text-stone-500 animate-pulse">A carregar...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 text-stone-500 border border-dashed border-stone-700 rounded-2xl">
              Nenhum grupo agendado para hoje.
            </div>
          ) : (
            schedules.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSchedule(s.id)}
                className="w-full text-left bg-stone-800 hover:bg-stone-700 rounded-2xl p-4 transition border border-stone-700"
              >
                <p className="font-bold text-white">{s.tour_title}</p>
                <p className="text-stone-400 text-sm">{s.start_time.slice(0, 5)} — {s.confirmed_people}/{s.max_people} pessoas</p>
                <div className="mt-2 flex gap-2">
                  <span className="bg-stone-700 text-stone-300 text-xs px-2 py-0.5 rounded-full">
                    {s.bookings.length} reservas
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.bookings.every((b: Booking) => b.checked_in_at)
                      ? 'bg-green-900 text-green-400' : 'bg-amber-900 text-amber-400'
                  }`}>
                    {s.bookings.filter((b: Booking) => b.checked_in_at).length} check-ins
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        currentSchedule && (
          <PassengerList
            schedule={currentSchedule}
            bookings={currentSchedule.bookings}
            onBack={() => setSelectedSchedule(null)}
          />
        )
      )}
    </div>
  );
}
