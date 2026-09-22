// Z-API — o disparo para o provedor "zapi" é tratado de forma unificada em
// sendWhatsAppNotification (src/lib/whatsapp/evolution.ts). Este helper isolado
// permite disparo direto via Z-API quando necessário.

interface ZapiSendInput {
  phone: string;   // Formato: 5585999999999
  message: string;
}

export async function sendZapiText({ phone, message }: ZapiSendInput) {
  const res = await fetch(
    `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
    }
  );
  if (!res.ok) throw new Error(`Z-API error ${res.status}: ${await res.text()}`);
  return res.json();
}
