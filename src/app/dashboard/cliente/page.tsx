import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Ticket, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  confirmada: 'bg-green-100 text-green-700',
  pendente: 'bg-amber-100 text-amber-700',
  cancelada: 'bg-red-100 text-red-700',
  concluida: 'bg-stone-200 text-stone-700',
};

export default async function ClienteDashboardPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/dashboard/cliente');

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      tour:tours(title),
      schedule:tour_schedules(schedule_date, start_time),
      agency:agencies(name)
    `)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-stone-800">Minhas Reservas</h1>

      {(bookings ?? []).length === 0 ? (
        <div className="card text-center py-16 text-stone-500">
          <Ticket className="w-10 h-10 mx-auto mb-3 text-stone-300" />
          Você ainda não tem reservas.{' '}
          <Link href="/explorar" className="text-amber-600 font-semibold hover:underline">Explorar passeios</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(bookings ?? []).map((b: any) => (
            <Link key={b.id} href={`/minha-reserva/${b.booking_ref}`}
              className="card flex items-center justify-between hover:shadow-md transition">
              <div>
                <p className="font-bold text-stone-800">{b.tour?.title ?? 'Passeio'}</p>
                <p className="text-stone-500 text-sm">
                  {b.agency?.name} ·{' '}
                  {b.schedule?.schedule_date
                    ? new Date(b.schedule.schedule_date + 'T00:00:00').toLocaleDateString('pt-BR')
                    : '—'}
                </p>
                <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[b.status] ?? 'bg-stone-100 text-stone-600'}`}>
                  {b.status}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
