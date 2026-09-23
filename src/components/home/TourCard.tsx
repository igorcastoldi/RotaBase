'use client';

import { Star, MapPin, Clock, Car } from 'lucide-react';
import type { Tour } from '@/data/tours';

export function TourCard({ tour, onBook }: { tour: Tour; onBook: (tour: Tour) => void }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 transition duration-300 hover:border-orange-500/40 hover:-translate-y-1">
      <div className="relative h-52 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tour.image || '/placeholder.svg'}
          alt={tour.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/10 to-transparent" />

        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm flex items-center gap-1">
          <Car className="h-3 w-3 text-orange-400" />
          {tour.vehicle}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-black flex items-center gap-1">
          <Star className="h-3 w-3 fill-black" />
          {tour.rating.toFixed(1)}
        </span>

        <div className="absolute bottom-3 left-4 right-4">
          <p className="flex items-center gap-1 text-xs font-medium text-orange-300">
            <MapPin className="h-3.5 w-3.5" />
            {tour.location}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-white">{tour.title}</h3>

        <div className="mt-2 flex items-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-orange-500" />
            {tour.duration}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-orange-500" />
            {tour.reviews} avaliações
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-neutral-500">a partir de</p>
            <p className="text-2xl font-extrabold text-white">
              R$ {tour.price}
              <span className="text-sm font-medium text-neutral-500"> /pessoa</span>
            </p>
          </div>
          <button
            onClick={() => onBook(tour)}
            className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-orange-400"
          >
            Agendar Passeio
          </button>
        </div>
      </div>
    </article>
  );
}
