import { Mountain, ShieldCheck, HeartHandshake } from 'lucide-react';

export const metadata = {
  title: 'Sobre | RotaBase',
  description: 'Conheça a RotaBase, a plataforma que conecta aventureiros às melhores agências de passeios off-road do Brasil.',
};

export default function SobrePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-2xl">
          <Mountain className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-stone-800">Sobre a RotaBase</h1>
        <p className="text-stone-600 leading-relaxed">
          A RotaBase é a maior plataforma de turismo de aventura off-road do Brasil. Conectamos
          aventureiros a agências verificadas que oferecem passeios de quadriciclo, UTV e 4x4 com
          segurança, qualidade e experiências inesquecíveis.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="card space-y-2">
          <ShieldCheck className="w-8 h-8 text-amber-600" />
          <h2 className="font-bold text-stone-800 text-lg">Agências Verificadas</h2>
          <p className="text-stone-500 text-sm">
            Todas as agências parceiras passam por um processo de verificação, garantindo
            equipamentos revisados e guias treinados.
          </p>
        </div>
        <div className="card space-y-2">
          <HeartHandshake className="w-8 h-8 text-amber-600" />
          <h2 className="font-bold text-stone-800 text-lg">Experiências Reais</h2>
          <p className="text-stone-500 text-sm">
            Reservas simples, pagamento nacional (PIX e cartão) e avaliações reais de quem já
            viveu a aventura.
          </p>
        </div>
      </div>
    </main>
  );
}
