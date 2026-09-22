'use server';
import { createServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

interface SignWaiverInput {
  bookingId: string;
  agencyId: string;
  clientId: string;
  signer_name: string;
  signer_cpf: string;
  signer_rg: string;
  signer_birthdate: string;
  signer_phone: string;
  signatureData: string;
}

export async function signWaiver(input: SignWaiverInput) {
  const supabase = createServerClient();

  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';

  const { data, error } = await supabase
    .from('waivers')
    .insert({
      booking_id: input.bookingId,
      client_id: input.clientId,
      agency_id: input.agencyId,
      signer_name: input.signer_name,
      signer_cpf: input.signer_cpf,
      signer_rg: input.signer_rg || null,
      signer_birthdate: input.signer_birthdate || null,
      signer_phone: input.signer_phone || null,
      signature_data: input.signatureData,
      signature_ip: ip,
      signed_at: new Date().toISOString(),
      status: 'assinado',
      is_main_client: true,
    })
    .select()
    .single();

  if (error) throw new Error('Erro ao registrar termo: ' + error.message);

  // Marcar booking como confirmado (após assinatura)
  await supabase
    .from('bookings')
    .update({ status: 'confirmada' })
    .eq('id', input.bookingId);

  revalidatePath('/minha-reserva');
  return data;
}
