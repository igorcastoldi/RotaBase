'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, ChevronRight, Filter } from 'lucide-react';
import type { Tour } from '@/types/database';

interface Props {
  tours: Tour[];
  agencySlug: string;
}

export default function AgencyTours({ tours, agencySlug }: Props) {
  const [search, setSearch] = useState('');

  const filtered = tours.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="passeios" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-stone-800">Nossos Passeios</h2>
        <div className="relative max-w-xs w-full">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Filtrar passeios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-stone-500 text-center py-12">Nenhum passeio encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tour) => (
            <Link
              key={tour.id}
              href={`/agencia/${agencySlug}/passeio/${tour.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition border border-stone-100"
            >
              {/* Cover */}
              <div className="relative h-48 bg-stone-200">
                {tour.cover_image_url ? (
                  <Image src={tour.cover_image_url} alt={tour.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                    <span className="text-amber-700 text-4xl">🏍️</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                  R$ {tour.price_per_person.toFixed(2).replace('.', ',')} / pessoa
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-stone-800 text-lg group-hover:text-amber-600 transition line-clamp-2">
                  {tour.title}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-stone-500 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.floor(tour.duration_minutes / 60)}h{tour.duration_minutes % 60 > 0 ? `${tour.duration_minutes % 60}min` : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Até {tour.max_people} pessoas
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-amber-600 font-semibold text-sm">Ver horários disponíveis</span>
                  <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
