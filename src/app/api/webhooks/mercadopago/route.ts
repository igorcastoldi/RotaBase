import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const body = await request.json();

  if (body.type === 'payment' && body.data?.id) {
    const paymentId = body.data.id.toString();
    if (body.action === 'payment.updated') {
      await supabase
        .from('payment_transactions')
        .update({ gateway_status: body.data.status })
        .eq('gateway_tx_id', paymentId);
    }
  }

  return NextResponse.json({ received: true });
}
