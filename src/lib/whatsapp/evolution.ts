import { createServerClient } from '@/lib/supabase/server';

interface SendParams {
  agency: {
    id: string;
    whatsapp_api_provider: string;
    whatsapp_api_url: string;
    whatsapp_instance: string;
  };
  phone: string;         // Formato: 5585999999999
  message: string;
  bookingId: string;
  templateName: string;
  recipientType: 'cliente' | 'proprietario' | 'guia';
}

export async function sendWhatsAppNotification(params: SendParams) {
  const { agency, phone, message, bookingId, templateName, recipientType } = params;
  const supabase = createServerClient();

  let providerMsgId: string | null = null;
  let status: 'enviado' | 'falhou' = 'falhou';
  let errorMsg: string | null = null;

  try {
    if (agency.whatsapp_api_provider === 'evolution') {
      const res = await fetch(
        `${agency.whatsapp_api_url}/message/sendText/${agency.whatsapp_instance}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: process.env.EVOLUTION_API_KEY!,
          },
          body: JSON.stringify({
            number: phone,
            text: message,
          }),
        }
      );
      const json = await res.json();
      if (res.ok) {
        providerMsgId = json.key?.id ?? json.id ?? null;
        status = 'enviado';
      } else {
        errorMsg = JSON.stringify(json);
      }
    } else if (agency.whatsapp_api_provider === 'zapi') {
      const res = await fetch(
        `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, message }),
        }
      );
      const json = await res.json();
      if (res.ok) {
        providerMsgId = json.messageId ?? null;
        status = 'enviado';
      } else {
        errorMsg = JSON.stringify(json);
      }
    }
  } catch (err: any) {
    errorMsg = err.message;
  }

  // Registrar log
  await supabase.from('whatsapp_logs').insert({
    agency_id: agency.id,
    booking_id: bookingId,
    recipient_type: recipientType,
    recipient_phone: phone,
    template_name: templateName,
    message_body: message,
    status,
    provider: agency.whatsapp_api_provider,
    provider_msg_id: providerMsgId,
    error_message: errorMsg,
    sent_at: status === 'enviado' ? new Date().toISOString() : null,
  });

  return { status, providerMsgId };
}
