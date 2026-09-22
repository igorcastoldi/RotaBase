'use client';
import {
  Car, IceCream2, Utensils, ShowerHead, Wifi, Sofa,
  Camera, Shield, Coffee, Shirt, Phone, CircleCheck,
} from 'lucide-react';
import type { AgencyAmenity } from '@/types/database';

// Mapa de ícones disponíveis
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  parking: Car,
  'ice-cream': IceCream2,
  crepe: Utensils,
  shower: ShowerHead,
  wifi: Wifi,
  lounge: Sofa,
  camera: Camera,
  shield: Shield,
  coffee: Coffee,
  shirt: Shirt,
  phone: Phone,
  default: CircleCheck,
};

interface Props { amenities: AgencyAmenity[] }

export default function AgencyAmenities({ amenities }: Props) {
  return (
    <section id="comodidades" className="space-y-4">
      <h2 className="text-2xl font-bold text-stone-800">Comodidades da Sede</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {amenities.map((amenity) => {
          const IconComponent = ICON_MAP[amenity.icon] ?? ICON_MAP.default;
          return (
            <div
              key={amenity.id}
              title={amenity.description ?? undefined}
              className="flex flex-col items-center justify-center gap-2 bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-400 hover:-translate-y-0.5 transition cursor-default"
            >
              <IconComponent className="w-7 h-7 text-amber-600" />
              <span className="text-sm font-medium text-stone-700 text-center leading-tight">
                {amenity.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
