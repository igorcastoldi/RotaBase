'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SignaturePad, { type SignaturePadHandle } from './SignaturePad';
import { signWaiver } from '@/actions/waiver.actions';
import { Loader2, CheckCircle } from 'lucide-react';

interface Props {
  bookingId: string;
  agencyId: string;
  clientId: string;
  bookingRef: string;
  onComplete?: () => void;
}

export default function WaiverForm({ bookingId, agencyId, clientId, bookingRef, onComplete }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  const signatureRef = useRef<SignaturePadHandle | null>(null);

  const [form, setForm] = useState({
    signer_name: '',
    signer_cpf: '',
    signer_rg: '',
    signer_birthdate: '',
    signer_phone: '',
    accepted: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.accepted) return alert('Você deve concordar com os termos.');
    if (signatureRef.current?.isEmpty()) return alert('Por favor, assine o termo.');

    const signatureData = signatureRef.current!.getDataURL();
    setLoading(true);
    try {
      await signWaiver({
        bookingId,
        agencyId,
        clientId,
        signer_name: form.signer_name,
        signer_cpf: form.signer_cpf,
        signer_rg: form.signer_rg,
        signer_birthdate: form.signer_birthdate,
        signer_phone: form.signer_phone,
        signatureData,
      });
      setSigned(true);
      setTimeout(() => {
        if (onComplete) onComplete();
        else router.push(`/minha-reserva/${bookingRef}`);
      }, 1500);
    } catch {
      alert('Erro ao registrar assinatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (signed) {
    return (
      <div className="text-center py-12 space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h3 className="text-xl font-bold text-stone-800">Termo assinado com sucesso!</h3>
        <p className="text-stone-600">Seu comprovante de reserva está sendo gerado...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 leading-relaxed space-y-2">
        <h3 className="font-bold text-base">Termo de Responsabilidade — {bookingRef}</h3>
        <p>Declaro estar ciente dos riscos inerentes à atividade de passeio de aventura com veículos off-road, incluso mas não limitado a quedas, colisões e acidentes naturais do percurso. Comprometo-me a seguir todas as orientações do guia responsável, utilizar os equipamentos de segurança fornecidos e não operar o veículo sob efeito de álcool ou substâncias.</p>
        <p>Isento a empresa operadora e seus colaboradores de responsabilidade civil em caso de acidentes decorrentes de ato próprio ou descumprimento das normas de segurança.</p>
      </div>

      {/* Dados do Signatário */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-1">Nome Completo *</label>
          <input
            required
            value={form.signer_name}
            onChange={(e) => setForm({ ...form, signer_name: e.target.value })}
            className="input-base"
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">CPF *</label>
          <input
            required
            value={form.signer_cpf}
            onChange={(e) => setForm({ ...form, signer_cpf: e.target.value })}
            className="input-base"
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">RG</label>
          <input
            value={form.signer_rg}
            onChange={(e) => setForm({ ...form, signer_rg: e.target.value })}
            className="input-base"
            placeholder="0000000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Data de Nascimento</label>
          <input
            type="date"
            value={form.signer_birthdate}
            onChange={(e) => setForm({ ...form, signer_birthdate: e.target.value })}
            className="input-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Telefone</label>
          <input
            type="tel"
            value={form.signer_phone}
            onChange={(e) => setForm({ ...form, signer_phone: e.target.value })}
            className="input-base"
            placeholder="(85) 99999-9999"
          />
        </div>
      </div>

      {/* Assinatura Digital */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Assinatura Digital *</label>
        <SignaturePad ref={signatureRef} />
        <p className="text-xs text-stone-400 mt-1">Assine com o dedo (celular) ou mouse (computador)</p>
      </div>

      {/* Checkbox de aceite */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.accepted}
          onChange={(e) => setForm({ ...form, accepted: e.target.checked })}
          className="mt-0.5 w-4 h-4 accent-amber-500"
          required
        />
        <span className="text-sm text-stone-700">
          Li e concordo com os termos de responsabilidade acima. Confirmo que todos os dados informados são verídicos.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-2xl shadow transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Registrando...</> : 'Assinar e Confirmar Reserva'}
      </button>
    </form>
  );
}
