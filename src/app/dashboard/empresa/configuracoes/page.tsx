import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AgencySettingsPanel from '@/components/dashboard/settings/AgencySettingsPanel';

export const dynamic = 'force-dynamic';

export default async function ConfiguracoesPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/dashboard/empresa/configuracoes');

  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!agency) {
    return (
      <div className="p-6 md:p-8">
        <div className="card text-center py-16">
          <h1 className="text-xl font-bold text-stone-800">Nenhuma agência vinculada</h1>
          <p className="text-stone-500 mt-2">Vincule ou cadastre uma agência para gerenciar as configurações.</p>
        </div>
      </div>
    );
  }

  const { data: amenities } = await supabase
    .from('agency_amenities')
    .select('*')
    .eq('agency_id', agency.id)
    .order('sort_order', { ascending: true });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-stone-800">Configurações da Empresa</h1>
      <AgencySettingsPanel agency={agency} amenities={amenities ?? []} />
    </div>
  );
}
