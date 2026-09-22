import { createServerClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, Clock, MapPin, Camera, Download, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PostBookingPortal({ params }: { params: { bookingRef: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/minha-reserva/' + params.bookingRef);

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      tour:tours(*),
      schedule:tour_schedules(*),
      agency:agencies(slug, name, logo_url, hq_google_maps_url, hq_waze_url),
      waivers(status, signed_at)
    `)
    .eq('booking_ref', params.bookingRef)
    .eq('client_id', user.id)
    .single();

  if (!booking) notFound();

  const scheduleDate = new Date(booking.schedule.schedule_date + 'T00:00:00');

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-9 h-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-800">Reserva {booking.booking_ref}</h1>
        <p className="text-stone-500 mt-1 capitalize">
          Status: <span className={`font-semibold ${
            booking.status === 'confirmada' ? 'text-green-600' :
            booking.status === 'pendente' ? 'text-amber-600' : 'text-stone-600'
          }`}>{booking.status}</span>
        </p>
      </div>

      {/* Detalhes do passeio */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 space-y-3">
        {booking.agency.logo_url && (
          <Image src={booking.agency.logo_url} alt={booking.agency.name} width={80} height={40}
            className="object-contain h-10 w-auto" />
        )}
        <h2 className="font-bold text-stone-800 text-lg">{booking.tour.title}</h2>
        <div className="text-stone-600 text-sm space-y-1.5">
          <p className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            {scheduleDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            &nbsp;às {booking.schedule.start_time.slice(0, 5)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" />
            {booking.agency.name}
          </p>
        </div>

        {/* Navegação */}
        <div className="flex gap-2 pt-2">
          {booking.agency.hq_google_maps_url && (
            <a href={booking.agency.hq_google_maps_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 text-center bg-blue-50 text-blue-700 font-medium text-sm py-2 rounded-xl hover:bg-blue-100 transition">
              Google Maps
            </a>
          )}
          {booking.agency.hq_waze_url && (
            <a href={booking.agency.hq_waze_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 text-center bg-sky-50 text-sky-700 font-medium text-sm py-2 rounded-xl hover:bg-sky-100 transition">
              Waze
            </a>
          )}
        </div>
      </div>

      {/* Termo de Responsabilidade */}
      <div className={`rounded-2xl border p-4 ${
        booking.waivers?.[0]?.status === 'assinado'
          ? 'bg-green-50 border-green-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <p className="font-medium text-sm">
          {booking.waivers?.[0]?.status === 'assinado'
            ? '✅ Termo assinado em ' + new Date(booking.waivers[0].signed_at!).toLocaleDateString('pt-BR')
            : '⚠️ Termo de Responsabilidade pendente de assinatura'}
        </p>
      </div>

      {/* Galeria de Fotos Pós-Passeio */}
      {booking.photo_gallery_url && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 space-y-3">
          <div className="flex items-center gap-2 font-bold text-stone-800">
            <Camera className="w-5 h-5 text-amber-500" />
            Suas Fotos e Vídeos
          </div>
          <p className="text-stone-600 text-sm">O álbum do seu passeio está disponível para download.</p>
          <a href={booking.photo_gallery_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition">
            <Download className="w-5 h-5" />
            Baixar Fotos e Vídeos
          </a>
        </div>
      )}

      {/* Deixar Avaliação */}
      {booking.status === 'concluida' && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 space-y-3">
          <div className="flex items-center gap-2 font-bold text-stone-800">
            <Star className="w-5 h-5 text-amber-500" />
            Avalie seu Passeio
          </div>
          <p className="text-stone-600 text-sm">Sua opinião ajuda outros aventureiros a escolherem.</p>
          <a href={`/agencia/${booking.agency.slug ?? ''}?review=${booking.id}`}
            className="block text-center bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 rounded-xl transition">
            Deixar Avaliação
          </a>
        </div>
      )}
    </main>
  );
}
