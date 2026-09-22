import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  // Validar token do webhook
  const token = request.headers.get('asaas-webhook-token');
  if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { event, payment } = body;

  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    await supabase
      .from('bookings')
      .update({
        payment_status: 'pago',
        amount_paid: payment.value,
        status: 'confirmada',
      })
      .eq('gateway_payment_id', payment.id);
  }

  return NextResponse.json({ received: true });
}
