'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Calendar, Clock, Users } from 'lucide-react';
import type { TourSchedule } from '@/types/database';

interface Props {
  tourId: string;
  agencyId: string;
  selected: string | null;
  onSelect: (schedule: TourSchedule & { available_spots: number }) => void;
}

export default function SchedulePicker({ tourId, agencyId, selected, onSelect }: Props) {
  const supabase = createBrowserClient();
  const [schedules, setSchedules] = useState<(TourSchedule & { available_spots: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const query = supabase
        .from('tour_schedules')
        .select('*')
        .eq('tour_id', tourId)
        .eq('agency_id', agencyId)
        .eq('is_active', true)
        .gte('schedule_date', today)
        .order('schedule_date', { ascending: true })
        .order('start_time', { ascending: true });

      const { data } = await query;
      if (data) {
        setSchedules(data.map((s) => ({
          ...s,
          available_spots: s.max_people - s.confirmed_people,
        })));
      }
      setLoading(false);
    }
    load();
  }, [tourId, agencyId]);

  const uniqueDates = [...new Set(schedules.map((s) => s.schedule_date))];
  const filtered = selectedDate
    ? schedules.filter((s) => s.schedule_date === selectedDate)
    : schedules;

  if (loading) return <div className="text-center py-8 text-stone-400 animate-pulse">Buscando horários...</div>;
  if (schedules.length === 0) return <div className="text-center py-8 text-stone-500">Nenhum horário disponível no momento.</div>;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-stone-800 text-lg">Selecione um horário</h3>

      {/* Filtro por data */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedDate('')}
          className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium border transition ${
            selectedDate === '' ? 'bg-amber-500 text-white border-amber-500' : 'border-stone-200 text-stone-600 hover:border-amber-300'
          }`}
        >
          Todos
        </button>
        {uniqueDates.map((date) => {
          const d = new Date(date + 'T00:00:00');
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium border transition ${
                selectedDate === date ? 'bg-amber-500 text-white border-amber-500' : 'border-stone-200 text-stone-600 hover:border-amber-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista de lotes */}
      <div className="space-y-3">
        {filtered.map((schedule) => {
          const isFull = schedule.available_spots <= 0;
          const isSelected = selected === schedule.id;
          const d = new Date(schedule.schedule_date + 'T00:00:00');
          return (
            <button
              key={schedule.id}
              disabled={isFull}
              onClick={() => !isFull && onSelect(schedule)}
              className={`w-full text-left rounded-2xl border-2 p-4 transition ${
                isSelected ? 'border-amber-500 bg-amber-50' :
                isFull ? 'border-stone-200 bg-stone-50 opacity-50 cursor-not-allowed' :
                'border-stone-200 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-semibold text-stone-800">
                    {d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                  </p>
                  <p className="flex items-center gap-1 text-stone-600 text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {schedule.start_time.slice(0, 5)}
                    {schedule.end_time && ` – ${schedule.end_time.slice(0, 5)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm flex items-center gap-1 ${isFull ? 'text-red-500' : 'text-green-600'}`}>
                    <Users className="w-3.5 h-3.5" />
                    {isFull ? 'Esgotado' : `${schedule.available_spots} vagas`}
                  </p>
                  {schedule.price_override && (
                    <p className="text-amber-600 font-semibold text-sm">
                      R$ {schedule.price_override.toFixed(2).replace('.', ',')}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
