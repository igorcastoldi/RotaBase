'use client';
import { useState } from 'react';
import { updatePaymentSettings } from '@/actions/agency.actions';
import { Loader2, Info } from 'lucide-react';
import type { Agency, PaymentPolicy } from '@/types/database';

export default function PaymentSettings({ agency }: { agency: Agency }) {
  const [saving, setSaving] = useState(false);
  const [policy, setPolicy] = useState<PaymentPolicy>(agency.payment_policy);
  const [depositType, setDepositType] = useState<'percentual' | 'valor_fixo'>(
    agency.deposit_type ?? 'percentual'
  );
  const [depositValue, setDepositValue] = useState(agency.deposit_value?.toString() ?? '30');
  const [gateway, setGateway] = useState(agency.payment_gateway ?? 'none');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePaymentSettings(agency.id, {
        payment_policy: policy,
        deposit_type: policy === 'sinal' ? depositType : null,
        deposit_value: policy === 'sinal' ? parseFloat(depositValue) : null,
        payment_gateway: gateway,
      });
      alert('Configurações de pagamento salvas!');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-lg">
      {/* Política de pagamento */}
      <div>
        <h3 className="font-semibold text-stone-800 mb-3">Política de Cobrança Online</h3>
        <div className="space-y-3">
          {([
            { value: 'integral', label: 'Cobrar 100% no ato da reserva', desc: 'O cliente paga o valor total online.' },
            { value: 'sinal', label: 'Cobrar apenas o Sinal (Entrada)', desc: 'O cliente paga uma entrada. O restante paga no local.' },
          ] as const).map((opt) => (
            <label key={opt.value}
              className={`flex gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${
                policy === opt.value ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-amber-300'
              }`}>
              <input type="radio" name="policy" value={opt.value}
                checked={policy === opt.value} onChange={() => setPolicy(opt.value)}
                className="mt-0.5 accent-amber-500" />
              <div>
                <p className="font-medium text-stone-800">{opt.label}</p>
                <p className="text-stone-500 text-sm">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Config do sinal */}
      {policy === 'sinal' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-4">
          <p className="flex items-center gap-2 text-amber-800 text-sm font-medium">
            <Info className="w-4 h-4" /> Configure o valor do sinal
          </p>
          <div className="flex gap-3">
            <select value={depositType} onChange={(e) => setDepositType(e.target.value as any)}
              className="input-base flex-1">
              <option value="percentual">Percentual (%)</option>
              <option value="valor_fixo">Valor Fixo (R$)</option>
            </select>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                {depositType === 'percentual' ? '%' : 'R$'}
              </span>
              <input type="number" min={1} step={depositType === 'percentual' ? 1 : 0.01}
                value={depositValue} onChange={(e) => setDepositValue(e.target.value)}
                className="input-base pl-8" />
            </div>
          </div>
        </div>
      )}

      {/* Gateway */}
      <div>
        <h3 className="font-semibold text-stone-800 mb-3">Gateway de Pagamento</h3>
        <select value={gateway} onChange={(e) => setGateway(e.target.value)}
          className="input-base w-full">
          <option value="none">Selecionar...</option>
          <option value="mercado_pago">Mercado Pago</option>
          <option value="asaas">Asaas</option>
        </select>
        <p className="text-stone-500 text-sm mt-1">
          As chaves de API do gateway são configuradas nas variáveis de ambiente do servidor.
        </p>
      </div>

      <button type="submit" disabled={saving}
        className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl transition disabled:opacity-60 flex items-center gap-2">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar Configurações'}
      </button>
    </form>
  );
}
