'use client';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Agency } from '@/types/database';

interface Props { agency: Agency }

export default function AgencyHero({ agency }: Props) {
  return (
    <section className="relative w-full h-72 md:h-96 overflow-hidden">
      {/* Banner */}
      {agency.banner_url ? (
        <Image src={agency.banner_url} alt={agency.name} fill className="object-cover" priority />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-amber-700 to-orange-500" />
      )}
      <div className="absolute inset-0 bg-black/40" />

      {/* Overlay com Logo + Nome + Rating */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
        {agency.logo_url && (
          <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image src={agency.logo_url} alt={`Logo ${agency.name}`} fill className="object-cover" />
          </div>
        )}
        <h1 className="text-3xl md:text-5xl font-extrabold text-center drop-shadow">{agency.name}</h1>
        {agency.total_reviews > 0 && (
          <div className="flex items-center gap-2 mt-3 bg-black/30 px-4 py-1.5 rounded-full">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-lg">{agency.avg_rating.toFixed(1)}</span>
            <span className="text-white/70 text-sm">({agency.total_reviews} avaliações)</span>
          </div>
        )}
      </div>
    </section>
  );
}
