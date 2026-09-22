'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import PassengerList from './PassengerList';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Wifi, WifiOff, RefreshCw, CalendarDays } from 'lucide-react';
import type { Booking, TourSchedule } from '@/types/database';

export default function GuideDashboard({ guideId }: { guideId: string }) {
  const supabase = createBrowserClient();
  const { isOnline, lastSync, syncToLocal } = useOfflineSync();
  const [schedules, setSchedules] = useState<(TourSchedule & { bookings: Booking[]; tour_title: string })[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadTodaySchedules() {
    setLoading(true);
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
      // Salva offline
      await syncToLocal('guide_schedules', mapped);
    }
    setLoading(false);
  }

  useEffect(() => { loadTodaySchedules(); }, []);

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
          <button onClick={loadTodaySchedules} disabled={!isOnline} className="text-stone-400 hover:text-white transition disabled:opacity-40">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {lastSync && (
        <p className="text-xs text-stone-500">
          Última sincronização: {new Date(lastSync).toLocaleTimeString('pt-BR')}
        </p>
      )}

      {/* Lista de passeios do dia */}
      {!selectedSchedule ? (
        <div className="space-y-3">
          <h2 className="font-semibold text-stone-300 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Lotes de Hoje
          </h2>
          {loading ? (
            <div className="text-center py-8 text-stone-500 animate-pulse">Carregando...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 text-stone-500">Nenhum lote agendado para hoje.</div>
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
