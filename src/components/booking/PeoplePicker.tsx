'use client';
import { Minus, Plus, ArrowLeft, ArrowRight, Users } from 'lucide-react';

interface Props {
  maxPeople: number;
  value: number;
  onChange: (n: number) => void;
  passengerNames: string[];
  onPassengerNameChange: (idx: number, name: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PeoplePicker({
  maxPeople,
  value,
  onChange,
  passengerNames,
  onPassengerNameChange,
  onNext,
  onBack,
}: Props) {
  const canDecrease = value > 1;
  const canIncrease = value < maxPeople;

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-stone-800 text-lg flex items-center gap-2">
        <Users className="w-5 h-5 text-amber-500" /> Quantas pessoas?
      </h3>

      {/* Contador */}
      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => canDecrease && onChange(value - 1)}
          disabled={!canDecrease}
          className="w-11 h-11 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-600 hover:border-amber-400 disabled:opacity-40 transition"
          aria-label="Diminuir"
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="text-4xl font-extrabold text-stone-800 w-16 text-center">{value}</span>
        <button
          type="button"
          onClick={() => canIncrease && onChange(value + 1)}
          disabled={!canIncrease}
          className="w-11 h-11 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-600 hover:border-amber-400 disabled:opacity-40 transition"
          aria-label="Aumentar"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <p className="text-center text-stone-400 text-sm">Máximo de {maxPeople} pessoas neste lote</p>

      {/* Nomes dos acompanhantes */}
      {value > 1 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-stone-700">Nome dos acompanhantes</p>
          {Array.from({ length: value - 1 }).map((_, idx) => (
            <input
              key={idx}
              value={passengerNames[idx] ?? ''}
              onChange={(e) => onPassengerNameChange(idx, e.target.value)}
              className="input-base"
              placeholder={`Acompanhante ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <button type="button" onClick={onNext} className="btn-primary flex-1">
          Continuar <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
