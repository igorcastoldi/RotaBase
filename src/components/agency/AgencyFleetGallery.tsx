'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Bike, X } from 'lucide-react';

interface Props {
  images: string[];
  agencyName: string;
}

export default function AgencyFleetGallery({ images, agencyName }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <section id="frota" className="space-y-4">
      <div className="flex items-center gap-2">
        <Bike className="w-6 h-6 text-amber-500" />
        <h2 className="text-2xl font-bold text-stone-800">Nossa Frota</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((src, idx) => (
          <button
            key={`${src}-${idx}`}
            onClick={() => setLightbox(src)}
            className="relative aspect-square rounded-2xl overflow-hidden bg-stone-200 group"
          >
            <Image
              src={src}
              alt={`${agencyName} — veículo ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition duration-500"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4"
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white hover:text-amber-400 transition"
            aria-label="Fechar"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full max-w-3xl aspect-video">
            <Image src={lightbox} alt={agencyName} fill className="object-contain" />
          </div>
        </div>
      )}
    </section>
  );
}
