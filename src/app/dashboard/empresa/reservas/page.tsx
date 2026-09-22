import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  confirmada: 'bg-green-100 text-green-700',
  pendente: 'bg-amber-100 text-amber-700',
  cancelada: 'bg-red-100 text-red-700',
  concluida: 'bg-stone-200 text-stone-700',
};

export default async function ReservasPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/dashboard/empresa/reservas');

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  const { data: bookings } = agency
    ? await supabase
        .from('bookings')
        .select(`
          *,
          tour:tours(title),
          schedule:tour_schedules(schedule_date, start_time),
          client:users(full_name, phone)
        `)
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false })
    : { data: [] as any[] };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-stone-800">Reservas</h1>

      {(bookings ?? []).length === 0 ? (
        <div className="card text-center py-16 text-stone-500">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 text-stone-300" />
          Nenhuma reserva encontrada.
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone-500 border-b border-stone-100">
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Passeio</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Pessoas</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {(bookings ?? []).map((b: any) => (
                <tr key={b.id} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="px-4 py-3 font-mono text-stone-700">{b.booking_ref}</td>
                  <td className="px-4 py-3 text-stone-700">{b.client?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-stone-700">{b.tour?.title ?? '—'}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {b.schedule?.schedule_date
                      ? new Date(b.schedule.schedule_date + 'T00:00:00').toLocaleDateString('pt-BR')
                      : '—'}
                    {b.schedule?.start_time ? ` ${b.schedule.start_time.slice(0, 5)}` : ''}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{b.num_people}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[b.status] ?? 'bg-stone-100 text-stone-600'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
