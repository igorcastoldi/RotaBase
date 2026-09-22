'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SchedulePicker from './SchedulePicker';
import PeoplePicker from './PeoplePicker';
import PaymentStep from './PaymentStep';
import type { Agency, Tour, TourSchedule } from '@/types/database';

type Step = 'schedule' | 'people' | 'payment';

interface Props {
  tour: Tour;
  agency: Agency;
}

export interface BookingState {
  scheduleId: string | null;
  schedule: (TourSchedule & { available_spots?: number }) | null;
  numPeople: number;
  passengerNames: string[];
  paymentMethod: 'pix' | 'cartao_credito' | null;
}

export default function BookingWizard({ tour, agency }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('schedule');
  const [booking, setBooking] = useState<BookingState>({
    scheduleId: null,
    schedule: null,
    numPeople: 1,
    passengerNames: [],
    paymentMethod: null,
  });

  const totalAmount = booking.numPeople * (booking.schedule?.price_override ?? tour.price_per_person);
  const depositAmount = agency.payment_policy === 'sinal'
    ? agency.deposit_type === 'percentual'
      ? totalAmount * ((agency.deposit_value ?? 30) / 100)
      : agency.deposit_value ?? 0
    : totalAmount;

  const amountDue = depositAmount;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
      {/* Steps Indicator */}
      <div className="flex border-b">
        {(['schedule', 'people', 'payment'] as Step[]).map((s, idx) => (
          <div
            key={s}
            className={`flex-1 py-3 text-center text-sm font-semibold transition ${
              step === s ? 'bg-amber-500 text-white' :
              (['schedule', 'people', 'payment'].indexOf(step) > idx)
                ? 'bg-green-50 text-green-700' : 'text-stone-400'
            }`}
          >
            {idx + 1}. {s === 'schedule' ? 'Horário' : s === 'people' ? 'Passageiros' : 'Pagamento'}
          </div>
        ))}
      </div>

      <div className="p-6">
        {step === 'schedule' && (
          <SchedulePicker
            tourId={tour.id}
            agencyId={agency.id}
            selected={booking.scheduleId}
            onSelect={(schedule) => {
              setBooking((b) => ({ ...b, scheduleId: schedule.id, schedule }));
              setStep('people');
            }}
          />
        )}

        {step === 'people' && (
          <PeoplePicker
            maxPeople={booking.schedule?.available_spots ?? tour.max_people}
            value={booking.numPeople}
            onChange={(n) => setBooking((b) => ({
              ...b,
              numPeople: n,
              passengerNames: Array(Math.max(0, n - 1)).fill(''),
            }))}
            passengerNames={booking.passengerNames}
            onPassengerNameChange={(idx, name) =>
              setBooking((b) => {
                const names = [...b.passengerNames];
                names[idx] = name;
                return { ...b, passengerNames: names };
              })
            }
            onNext={() => setStep('payment')}
            onBack={() => setStep('schedule')}
          />
        )}

        {step === 'payment' && (
          <PaymentStep
            tour={tour}
            agency={agency}
            booking={booking}
            totalAmount={totalAmount}
            amountDue={amountDue}
            onBack={() => setStep('people')}
            onSuccess={(bookingRef) => {
              router.push(`/agencia/${agency.slug}/reserva/${booking.scheduleId}/confirmacao?ref=${bookingRef}`);
            }}
          />
        )}
      </div>
    </div>
  );
}
