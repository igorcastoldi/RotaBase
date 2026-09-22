'use server';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateAgencySettings(agencyId: string, data: Record<string, any>) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autorizado');

  const { error } = await supabase
    .from('agencies')
    .update(data)
    .eq('id', agencyId);

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/empresa/configuracoes');
}

export async function updatePaymentSettings(agencyId: string, data: {
  payment_policy: string;
  deposit_type: string | null;
  deposit_value: number | null;
  payment_gateway: string;
}) {
  return updateAgencySettings(agencyId, data);
}

export async function updateWhatsAppSettings(agencyId: string, data: {
  whatsapp_api_provider: string;
  whatsapp_api_url: string;
  whatsapp_instance: string;
  notify_guide: boolean;
}) {
  return updateAgencySettings(agencyId, data);
}
