'use server';
import { createServerClient } from '@/lib/supabase/server';
import { createPaymentCharge } from '@/lib/payments/mercadopago';
import { sendWhatsAppNotification } from '@/lib/whatsapp/evolution';
import { revalidatePath } from 'next/cache';

interface CreateBookingInput {
  tourId: string;
  scheduleId: string;
  agencyId: string;
  numPeople: number;
  passengerNames: string[];
  paymentMethod: 'pix' | 'cartao_credito';
}

export async function createBooking(input: CreateBookingInput) {
  const supabase = createServerClient();

  // 1. Verificar sessão
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // 2. Verificar disponibilidade (função SQL)
  const { data: availability } = await supabase
    .rpc('check_schedule_availability', {
      p_schedule_id: input.scheduleId,
      p_num_people: input.numPeople,
    })
    .single<{ available: boolean; spots_remaining: number; reason: string }>();

  if (!availability?.available) {
    throw new Error(availability?.reason ?? 'Lote sem vagas disponíveis');
  }

  // 3. Buscar dados do tour e da agência
  const [{ data: tour }, { data: schedule }, { data: agency }] = await Promise.all([
    supabase.from('tours').select('*').eq('id', input.tourId).single(),
    supabase.from('tour_schedules').select('*').eq('id', input.scheduleId).single(),
    supabase.from('agencies').select('*').eq('id', input.agencyId).single(),
  ]);

  if (!tour || !schedule || !agency) throw new Error('Dados inválidos');

  const pricePerPerson = schedule.price_override ?? tour.price_per_person;
  const totalAmount = pricePerPerson * input.numPeople;

  let depositAmount: number;
  if (agency.payment_policy === 'integral') {
    depositAmount = totalAmount;
  } else {
    depositAmount = agency.deposit_type === 'percentual'
      ? totalAmount * ((agency.deposit_value ?? 30) / 100)
      : agency.deposit_value ?? 0;
  }

  // 4. Criar reserva (booking_ref gerado pelo trigger)
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      agency_id: input.agencyId,
      tour_id: input.tourId,
      schedule_id: input.scheduleId,
      client_id: user.id,
      num_people: input.numPeople,
      passenger_names: input.passengerNames,
      price_per_person: pricePerPerson,
      total_amount: totalAmount,
      payment_policy: agency.payment_policy,
      deposit_amount: depositAmount,
      payment_method: input.paymentMethod,
      status: 'pendente',
      payment_status: 'aguardando',
    })
    .select()
    .single();

  if (bookingError || !booking) throw new Error('Erro ao criar reserva');

  // 5. Gerar cobrança no gateway de pagamento
  let pixQrcode: string | null = null;
  let pixCopyPaste: string | null = null;
  let gatewayPaymentId: string | null = null;

  if (agency.payment_gateway === 'mercado_pago') {
    const charge: any = await createPaymentCharge({
      amount: depositAmount,
      method: input.paymentMethod,
      description: `${tour.title} — ${booking.booking_ref}`,
      externalRef: booking.id,
      payerEmail: user.email!,
    });
    gatewayPaymentId = charge.id?.toString() ?? null;
    pixQrcode = charge.point_of_interaction?.transaction_data?.qr_code_base64 ?? null;
    pixCopyPaste = charge.point_of_interaction?.transaction_data?.qr_code ?? null;
  }

  // 6. Atualizar booking com dados do gateway
  await supabase
    .from('bookings')
    .update({
      gateway_payment_id: gatewayPaymentId,
      gateway_pix_qrcode: pixQrcode,
      gateway_pix_copy_paste: pixCopyPaste,
    })
    .eq('id', booking.id);

  // 7. Buscar dados do cliente para WhatsApp
  const { data: clientProfile } = await supabase
    .from('users')
    .select('full_name, phone')
    .eq('id', user.id)
    .single();

  // 8. Disparar WhatsApps (assíncrono, não bloqueia o retorno)
  if (agency.whatsapp_api_provider !== 'none' && clientProfile?.phone) {
    void sendBookingWhatsApps({
      agency,
      booking: { ...booking, gateway_pix_copy_paste: pixCopyPaste },
      clientPhone: clientProfile.phone,
      clientName: clientProfile.full_name,
      tourTitle: tour.title,
      scheduleDate: schedule.schedule_date,
      scheduleTime: schedule.start_time,
    });
  }

  revalidatePath(`/agencia/${agency.slug}`);

  return {
    bookingRef: booking.booking_ref,
    bookingId: booking.id,
    pixQrcode,
    pixCopyPaste,
    amountDue: depositAmount,
    totalAmount,
    scheduleId: input.scheduleId,
  };
}

async function sendBookingWhatsApps(params: {
  agency: any;
  booking: any;
  clientPhone: string;
  clientName: string;
  tourTitle: string;
  scheduleDate: string;
  scheduleTime: string;
}) {
  const { agency, booking, clientPhone, clientName, tourTitle, scheduleDate, scheduleTime } = params;

  const dateFormatted = new Date(scheduleDate + 'T00:00:00')
    .toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

  const clientMsg = `🏍️ *RotaBase — Confirmação de Reserva*\n\nOlá, ${clientName}!\nSua reserva foi confirmada:\n\n*Passeio:* ${tourTitle}\n*Data:* ${dateFormatted}\n*Horário:* ${scheduleTime.slice(0, 5)}\n*Código:* ${booking.booking_ref}\n\n📍 *Ponto de partida:*\n${agency.hq_address}\n\n🗺️ Google Maps: ${agency.hq_google_maps_url ?? '-'}\n🚗 Waze: ${agency.hq_waze_url ?? '-'}\n\nNos vemos em breve! 🤙`;

  const ownerMsg = `🔔 *Nova Reserva Recebida!*\n\n*Passeio:* ${tourTitle}\n*Data:* ${dateFormatted} às ${scheduleTime.slice(0, 5)}\n*Cliente:* ${clientName}\n*Código:* ${booking.booking_ref}\n\nAcesse o painel para mais detalhes.`;

  await sendWhatsAppNotification({
    agency,
    phone: clientPhone,
    message: clientMsg,
    bookingId: booking.id,
    templateName: 'booking_confirmation',
    recipientType: 'cliente',
  });

  if (agency.hq_whatsapp_number) {
    await sendWhatsAppNotification({
      agency,
      phone: agency.hq_whatsapp_number,
      message: ownerMsg,
      bookingId: booking.id,
      templateName: 'new_booking_alert',
      recipientType: 'proprietario',
    });
  }
}
