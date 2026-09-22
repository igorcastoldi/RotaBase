import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const bookingRef = searchParams.ref;

  return (
    <main className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
        <CheckCircle className="w-11 h-11 text-green-600" />
      </div>
      <h1 className="text-3xl font-extrabold text-stone-800">Reserva Confirmada!</h1>
      <p className="text-stone-600">
        Sua reserva foi registrada com sucesso.
        {bookingRef && (
          <>
            {' '}Código da reserva:{' '}
            <span className="font-bold text-amber-600">{bookingRef}</span>
          </>
        )}
      </p>
      <p className="text-stone-500 text-sm">
        Você receberá as informações do passeio e o termo de responsabilidade. Acompanhe todos os
        detalhes no seu portal de reserva.
      </p>
      {bookingRef && (
        <Link
          href={`/minha-reserva/${bookingRef}`}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow transition"
        >
          Ver Minha Reserva <ArrowRight className="w-5 h-5" />
        </Link>
      )}
    </main>
  );
}
