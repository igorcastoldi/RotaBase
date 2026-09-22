'use client';
import Link from 'next/link';
import { CheckCircle, QrCode, ArrowRight } from 'lucide-react';

interface Props {
  bookingRef: string;
  pixCopyPaste?: string | null;
  amountDue?: number;
}

export default function BookingConfirmation({ bookingRef, pixCopyPaste, amountDue }: Props) {
  return (
    <div className="text-center space-y-5 py-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
        <CheckCircle className="w-9 h-9 text-green-600" />
      </div>
      <div>
        <h3 className="text-xl font-extrabold text-stone-800">Reserva criada!</h3>
        <p className="text-stone-500 mt-1">
          Código: <span className="font-bold text-amber-600">{bookingRef}</span>
        </p>
      </div>

      {pixCopyPaste && (
        <div className="bg-stone-50 rounded-2xl p-4 space-y-2 text-left">
          <p className="flex items-center gap-2 font-semibold text-stone-700 text-sm">
            <QrCode className="w-4 h-4 text-amber-500" /> PIX Copia e Cola
            {typeof amountDue === 'number' && (
              <span className="ml-auto text-amber-600">R$ {amountDue.toFixed(2).replace('.', ',')}</span>
            )}
          </p>
          <code className="block bg-white border border-stone-200 rounded-xl p-3 text-xs break-all text-stone-600">
            {pixCopyPaste}
          </code>
        </div>
      )}

      <Link href={`/minha-reserva/${bookingRef}`} className="btn-primary w-full">
        Ver minha reserva <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
