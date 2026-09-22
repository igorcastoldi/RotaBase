import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/dashboard');

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? 'cliente';

  return (
    <div className="min-h-screen flex bg-stone-100">
      <Sidebar role={role} userName={profile?.full_name ?? user.email ?? 'Usuário'} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
