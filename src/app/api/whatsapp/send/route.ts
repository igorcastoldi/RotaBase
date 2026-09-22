import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { sendWhatsAppNotification } from '@/lib/whatsapp/evolution';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { agencyId, phone, message, bookingId, templateName, recipientType } = body;

  if (!agencyId || !phone || !message) {
    return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes.' }, { status: 400 });
  }

  const { data: agency } = await supabase
    .from('agencies')
    .select('id, whatsapp_api_provider, whatsapp_api_url, whatsapp_instance')
    .eq('id', agencyId)
    .single();

  if (!agency || !agency.whatsapp_api_provider || agency.whatsapp_api_provider === 'none') {
    return NextResponse.json({ error: 'Agência sem provedor de WhatsApp configurado.' }, { status: 400 });
  }

  const result = await sendWhatsAppNotification({
    agency: {
      id: agency.id,
      whatsapp_api_provider: agency.whatsapp_api_provider,
      whatsapp_api_url: agency.whatsapp_api_url ?? '',
      whatsapp_instance: agency.whatsapp_instance ?? '',
    },
    phone,
    message,
    bookingId: bookingId ?? '',
    templateName: templateName ?? 'manual',
    recipientType: recipientType ?? 'cliente',
  });

  return NextResponse.json(result);
}
