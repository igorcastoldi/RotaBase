'use client';
import { useState } from 'react';
import { QrCode, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { createBooking } from '@/actions/booking.actions';
import type { Agency, Tour } from '@/types/database';
import type { BookingState } from './BookingWizard';

interface Props {
  tour: Tour;
  agency: Agency;
  booking: BookingState;
  totalAmount: number;
  amountDue: number;
  onBack: () => void;
  onSuccess: (bookingRef: string) => void;
}

function formatBRL(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export default function PaymentStep({
  tour,
  agency,
  booking,
  totalAmount,
  amountDue,
  onBack,
  onSuccess,
}: Props) {
  const [method, setMethod] = useState<'pix' | 'cartao_credito'>('pix');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = totalAmount - amountDue;

  async function handleConfirm() {
    if (!booking.scheduleId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await createBooking({
        tourId: tour.id,
        scheduleId: booking.scheduleId,
        agencyId: agency.id,
        numPeople: booking.numPeople,
        passengerNames: booking.passengerNames,
        paymentMethod: method,
      });
      onSuccess(result.bookingRef);
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao processar a reserva. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-stone-800 text-lg">Pagamento</h3>

      {/* Resumo */}
      <div className="bg-stone-50 rounded-2xl p-4 space-y-2 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>{booking.numPeople}x {tour.title}</span>
          <span>{formatBRL(totalAmount)}</span>
        </div>
        {agency.payment_policy === 'sinal' && (
          <>
            <div className="flex justify-between text-stone-600">
              <span>Sinal (pago agora)</span>
              <span className="font-semibold text-amber-600">{formatBRL(amountDue)}</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>Restante (no local)</span>
              <span>{formatBRL(remaining)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between font-bold text-stone-800 border-t border-stone-200 pt-2">
          <span>Total a pagar agora</span>
          <span>{formatBRL(amountDue)}</span>
        </div>
      </div>

      {/* Método de pagamento */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMethod('pix')}
          className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition ${
            method === 'pix' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-stone-200 text-stone-600 hover:border-amber-300'
          }`}
        >
          <QrCode className="w-6 h-6" />
          <span className="text-sm font-semibold">PIX</span>
        </button>
        <button
          type="button"
          onClick={() => setMethod('cartao_credito')}
          className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition ${
            method === 'cartao_credito' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-stone-200 text-stone-600 hover:border-amber-300'
          }`}
        >
          <CreditCard className="w-6 h-6" />
          <span className="text-sm font-semibold">Cartão de Crédito</span>
        </button>
      </div>

      {error && <p className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5">{error}</p>}

      {/* Ações */}
      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={loading} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <button type="button" onClick={handleConfirm} disabled={loading} className="btn-primary flex-1">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</> : `Confirmar e pagar ${formatBRL(amountDue)}`}
        </button>
      </div>
    </div>
  );
}
