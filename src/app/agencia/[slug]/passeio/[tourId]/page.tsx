import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import BookingWizard from '@/components/booking/BookingWizard';
import Image from 'next/image';
import { Clock, Users } from 'lucide-react';

interface Props {
  params: { slug: string; tourId: string };
}

export const dynamic = 'force-dynamic';

export default async function TourPage({ params }: Props) {
  const supabase = createServerClient();
  const { data: tour } = await supabase.from('tours').select('*').eq('id', params.tourId).single();
  const { data: agency } = await supabase.from('agencies').select('*').eq('slug', params.slug).single();
  if (!tour || !agency) notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {tour.cover_image_url && (
          <div className="relative h-72 rounded-2xl overflow-hidden">
            <Image src={tour.cover_image_url} alt={tour.title} fill className="object-cover" />
          </div>
        )}
        <h1 className="text-3xl font-extrabold text-stone-800">{tour.title}</h1>
        <div className="flex flex-wrap gap-4 text-stone-600 text-sm">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-500" />{Math.floor(tour.duration_minutes / 60)}h</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4 text-amber-500" />Até {tour.max_people} pessoas</span>
        </div>
        {tour.description && <p className="text-stone-600">{tour.description}</p>}
      </div>
      <div className="lg:col-span-1">
        <BookingWizard tour={tour} agency={agency} />
      </div>
    </main>
  );
}
