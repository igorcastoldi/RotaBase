import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ExplorarPage() {
  const supabase = createServerClient();
  const { data: agencies } = await supabase
    .from('agencies')
    .select('id, slug, name, logo_url, banner_url, avg_rating, total_reviews, hq_address')
    .eq('is_active', true)
    .order('avg_rating', { ascending: false });

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-stone-800 mb-8">Explorar Agências</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(agencies ?? []).map((agency) => (
          <Link key={agency.id} href={`/agencia/${agency.slug}`}
            className="card hover:shadow-lg hover:-translate-y-0.5 transition group overflow-hidden p-0">
            <div className="relative h-40 bg-stone-200">
              {agency.banner_url
                ? <Image src={agency.banner_url} alt={agency.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                : <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-300" />}
            </div>
            <div className="p-4 space-y-1">
              <h2 className="font-bold text-stone-800 group-hover:text-amber-600 transition">{agency.name}</h2>
              {agency.hq_address && (
                <p className="text-stone-500 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{agency.hq_address}
                </p>
              )}
              {agency.total_reviews > 0 && (
                <p className="text-amber-600 text-sm flex items-center gap-1 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {agency.avg_rating.toFixed(1)} ({agency.total_reviews})
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
