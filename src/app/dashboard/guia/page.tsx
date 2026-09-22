import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import GuideDashboard from '@/components/guide/GuideDashboard';

export const dynamic = 'force-dynamic';

export default async function GuiaPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/dashboard/guia');

  return <GuideDashboard guideId={user.id} />;
}
