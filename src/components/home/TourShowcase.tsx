'use client';

import { useMemo, useState } from 'react';
import { Compass, MapPinOff } from 'lucide-react';
import { regions, tours, type Tour } from '@/data/tours';
import { TourCard } from './TourCard';
import { BookingModal } from './BookingModal';

export function TourShowcase() {
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  const filtered = useMemo(
    () => (activeRegion === 'all' ? tours : tours.filter((t) => t.regionId === activeRegion)),
    [activeRegion],
  );

  const activeRegionName =
    activeRegion === 'all' ? null : regions.find((r) => r.id === activeRegion)?.name ?? null;

  return (
    <section id="passeios" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-400">
          <Compass className="h-3.5 w-3.5" />
          Vitrine de Aventuras
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Escolha seu destino e caia na trilha
        </h2>
        <p className="mt-3 text-neutral-400">
          Selecione uma região para ver os passeios de quadriciclo, UTV e 4x4 disponíveis com operadores verificados.
        </p>
      </div>

      {/* Region filter */}
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        <FilterChip label="Todas as regiões" active={activeRegion === 'all'} onClick={() => setActiveRegion('all')} />
        {regions.map((r) => (
          <FilterChip
            key={r.id}
            label={`${r.name} · ${r.state}`}
            active={activeRegion === r.id}
            onClick={() => setActiveRegion(r.id)}
          />
        ))}
      </div>

      {/* Grid or empty state */}
      {filtered.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tour) => (
            <TourCard key={tour.id} tour={tour} onBook={setSelectedTour} />
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-12 max-w-md rounded-3xl border border-white/10 bg-neutral-900 p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10">
            <MapPinOff className="h-7 w-7 text-orange-400" />
          </div>
          <h3 className="text-lg font-bold text-white">
            Ainda não temos passeios em {activeRegionName}
          </h3>
          <p className="mt-2 text-sm text-neutral-400">
            Estamos expandindo para novas regiões. Em breve traremos operadores verificados para este destino.
          </p>
          <button
            onClick={() => setActiveRegion('all')}
            className="mt-5 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-orange-500/50 hover:text-orange-400"
          >
            Ver todos os destinos
          </button>
        </div>
      )}

      {selectedTour && <BookingModal tour={selectedTour} onClose={() => setSelectedTour(null)} />}
    </section>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-orange-500 text-black'
          : 'border border-white/10 bg-neutral-900 text-neutral-300 hover:border-orange-500/40 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}
