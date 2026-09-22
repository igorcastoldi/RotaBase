import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardIndexPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/dashboard');

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  switch (profile?.role) {
    case 'proprietario':
    case 'admin_empresa':
      redirect('/dashboard/empresa');
    case 'guia':
      redirect('/dashboard/guia');
    default:
      redirect('/dashboard/cliente');
  }
}
