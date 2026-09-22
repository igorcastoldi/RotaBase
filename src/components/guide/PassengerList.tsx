'use client';
import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import CheckInButton from './CheckInButton';
import { ArrowLeft, Phone, FileCheck2, FileWarning, Users } from 'lucide-react';
import type { Booking, TourSchedule } from '@/types/database';

interface Props {
  schedule: TourSchedule & { tour_title?: string };
  bookings: Booking[];
  onBack: () => void;
}

export default function PassengerList({ schedule, bookings, onBack }: Props) {
  const supabase = createBrowserClient();
  const [localBookings, setLocalBookings] = useState<Booking[]>(bookings);

  async function handleCheckIn(bookingId: string) {
    const checkedAt = new Date().toISOString();
    // Atualização otimista (funciona offline)
    setLocalBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, checked_in_at: checkedAt } : b))
    );
    try {
      await supabase.from('bookings').update({ checked_in_at: checkedAt }).eq('id', bookingId);
    } catch {
      // Mantém o estado local para sincronização posterior quando online
    }
  }

  const totalPeople = localBookings.reduce((acc, b) => acc + (b.num_people ?? 1), 0);
  const checkedIn = localBookings.filter((b) => b.checked_in_at).length;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-stone-400 hover:text-white transition text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar aos lotes
      </button>

      <div className="bg-stone-800 rounded-2xl p-4 border border-stone-700">
        <p className="font-bold text-white">{schedule.tour_title ?? 'Passeio'}</p>
        <p className="text-stone-400 text-sm flex items-center gap-2 mt-1">
          <Users className="w-4 h-4" /> {totalPeople} pessoa(s) · {checkedIn}/{localBookings.length} check-ins
        </p>
      </div>

      <div className="space-y-3">
        {localBookings.length === 0 ? (
          <div className="text-center py-10 text-stone-500">Nenhuma reserva neste lote.</div>
        ) : (
          localBookings.map((booking: any) => {
            const waiverSigned = booking.waivers?.[0]?.status === 'assinado';
            return (
              <div key={booking.id} className="bg-stone-800 border border-stone-700 p-4 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{booking.client?.full_name ?? booking.booking_ref}</p>
                    <p className="text-stone-400 text-xs">{booking.num_people} pessoa(s) · {booking.booking_ref}</p>
                    {booking.client?.phone && (
                      <a href={`tel:${booking.client.phone}`} className="text-sky-400 text-xs flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" /> {booking.client.phone}
                      </a>
                    )}
                    <span className={`inline-flex items-center gap-1 text-xs mt-2 px-2 py-0.5 rounded-full ${
                      waiverSigned ? 'bg-green-900 text-green-400' : 'bg-amber-900 text-amber-400'
                    }`}>
                      {waiverSigned ? <><FileCheck2 className="w-3 h-3" /> Termo assinado</> : <><FileWarning className="w-3 h-3" /> Termo pendente</>}
                    </span>
                  </div>
                  <CheckInButton
                    checkedIn={!!booking.checked_in_at}
                    onCheckIn={() => handleCheckIn(booking.id)}
                  />
                </div>

                {/* Acompanhantes */}
                {Array.isArray(booking.passenger_names) && booking.passenger_names.length > 0 && (
                  <div className="border-t border-stone-700 pt-2">
                    <p className="text-stone-500 text-xs mb-1">Acompanhantes:</p>
                    <p className="text-stone-300 text-sm">{booking.passenger_names.filter(Boolean).join(', ')}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
