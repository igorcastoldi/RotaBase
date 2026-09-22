import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { CalendarCheck, Users, Star, TrendingUp, Settings, ClipboardList } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EmpresaDashboardPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: agency } = await supabase
    .from('agencies')
    .select('id, name, slug, avg_rating, total_reviews')
    .eq('owner_id', user?.id ?? '')
    .single();

  let totalBookings = 0;
  let confirmedBookings = 0;
  if (agency) {
    const { count: total } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agency.id);
    const { count: confirmed } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agency.id)
      .eq('status', 'confirmada');
    totalBookings = total ?? 0;
    confirmedBookings = confirmed ?? 0;
  }

  const stats = [
    { icon: CalendarCheck, label: 'Reservas Totais', value: totalBookings },
    { icon: TrendingUp, label: 'Confirmadas', value: confirmedBookings },
    { icon: Star, label: 'Avaliação Média', value: agency?.avg_rating?.toFixed(1) ?? '—' },
    { icon: Users, label: 'Avaliações', value: agency?.total_reviews ?? 0 },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-800">Painel da Empresa</h1>
          <p className="text-stone-500">{agency?.name ?? 'Nenhuma agência vinculada'}</p>
        </div>
        {agency && (
          <Link href={`/agencia/${agency.slug}`} target="_blank"
            className="btn-secondary text-sm">Ver página pública</Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card space-y-2">
            <s.icon className="w-6 h-6 text-amber-500" />
            <p className="text-2xl font-extrabold text-stone-800">{s.value}</p>
            <p className="text-stone-500 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/empresa/reservas" className="card hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-stone-800">Gerenciar Reservas</p>
            <p className="text-stone-500 text-sm">Visualize e acompanhe as reservas</p>
          </div>
        </Link>
        <Link href="/dashboard/empresa/configuracoes" className="card hover:shadow-md transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
            <Settings className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-stone-800">Configurações</p>
            <p className="text-stone-500 text-sm">Perfil, pagamento, WhatsApp e comodidades</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
