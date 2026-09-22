import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import WaiverForm from '@/components/waiver/WaiverForm';

export const dynamic = 'force-dynamic';

export default async function WaiverPage({
  params,
  searchParams,
}: {
  params: { slug: string; scheduleId: string };
  searchParams: { bookingId?: string };
}) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: agency } = await supabase.from('agencies').select('id').eq('slug', params.slug).single();
  if (!searchParams.bookingId || !agency) redirect(`/agencia/${params.slug}`);

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-extrabold mb-6 text-center">Termo de Responsabilidade</h1>
      <WaiverForm
        bookingId={searchParams.bookingId}
        agencyId={agency.id}
        clientId={user.id}
        bookingRef={searchParams.bookingId}
      />
    </main>
  );
}
