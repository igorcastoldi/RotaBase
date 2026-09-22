import MercadoPagoConfig, { Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN ?? '',
  options: { timeout: 5000 },
});

interface ChargeInput {
  amount: number;
  method: 'pix' | 'cartao_credito';
  description: string;
  externalRef: string;
  payerEmail: string;
  cardToken?: string;     // Para cartão de crédito
  installments?: number;
}

export async function createPaymentCharge(input: ChargeInput) {
  const payment = new Payment(client);

  const body: any = {
    transaction_amount: input.amount,
    description: input.description,
    external_reference: input.externalRef,
    payer: { email: input.payerEmail },
  };

  if (input.method === 'pix') {
    body.payment_method_id = 'pix';
  } else {
    body.payment_method_id = 'credit_card';
    body.token = input.cardToken;
    body.installments = input.installments ?? 1;
  }

  const result = await payment.create({ body });
  return result;
}
