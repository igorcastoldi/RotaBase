const ASAAS_API_URL = process.env.ASAAS_API_URL ?? 'https://api.asaas.com/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY ?? '';

interface AsaasChargeInput {
  customerId: string;   // ID do cliente no Asaas (criar se não existir)
  amount: number;
  dueDate: string;      // 'YYYY-MM-DD'
  description: string;
  billingType: 'PIX' | 'CREDIT_CARD';
  externalRef: string;
}

async function asaasFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${ASAAS_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
      ...((options.headers ?? {}) as Record<string, string>),
    },
  });
  if (!res.ok) throw new Error(`Asaas error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function createAsaasCustomer(name: string, cpf: string, email: string) {
  return asaasFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({ name, cpfCnpj: cpf, email }),
  });
}

export async function createAsaasCharge(input: AsaasChargeInput) {
  return asaasFetch('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: input.customerId,
      billingType: input.billingType,
      value: input.amount,
      dueDate: input.dueDate,
      description: input.description,
      externalReference: input.externalRef,
    }),
  });
}

// Buscar QR Code PIX de uma cobrança Asaas
export async function getAsaasPixQrCode(paymentId: string) {
  return asaasFetch(`/payments/${paymentId}/pixQrCode`);
}
