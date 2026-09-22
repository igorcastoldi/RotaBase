import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AgencyHero from '@/components/agency/AgencyHero';
import AgencyAbout from '@/components/agency/AgencyAbout';
import AgencyFleetGallery from '@/components/agency/AgencyFleetGallery';
import AgencyHQMap from '@/components/agency/AgencyHQMap';
import AgencyAmenities from '@/components/agency/AgencyAmenities';
import AgencyTours from '@/components/agency/AgencyTours';
import AgencyReviews from '@/components/agency/AgencyReviews';

interface Props {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('agencies')
    .select('name, description, banner_url')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();
  if (!data) return {};
  return {
    title: `${data.name} | RotaBase`,
    description: data.description?.slice(0, 160),
    openGraph: { images: data.banner_url ? [data.banner_url] : [] },
  };
}

export default async function AgencyPage({ params }: Props) {
  const supabase = createServerClient();
  const { data: agency, error } = await supabase
    .from('agencies')
    .select(`*, amenities:agency_amenities(*), tours(*), reviews(*, client:users(full_name, avatar_url))`)
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (error || !agency) notFound();

  return (
    <main className="min-h-screen bg-stone-50">
      <AgencyHero agency={agency} />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-16">
        <AgencyAbout agency={agency} />
        {agency.fleet_gallery_urls?.length > 0 && (
          <AgencyFleetGallery images={agency.fleet_gallery_urls} agencyName={agency.name} />
        )}
        <AgencyHQMap agency={agency} />
        {agency.amenities?.length > 0 && <AgencyAmenities amenities={agency.amenities} />}
        <AgencyTours tours={agency.tours ?? []} agencySlug={params.slug} />
        <AgencyReviews
          reviews={agency.reviews ?? []}
          avgRating={agency.avg_rating}
          totalReviews={agency.total_reviews}
        />
      </div>
    </main>
  );
}
