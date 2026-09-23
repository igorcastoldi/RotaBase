'use client';

import { useState } from 'react';
import { X, CalendarX2, BellRing, MapPin, Clock, Car, CheckCircle2 } from 'lucide-react';
import type { Tour } from '@/data/tours';

export function BookingModal({ tour, onClose }: { tour: Tour; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Reserva — ${tour.title}`}
    >
      <div
        className="relative w-full sm:max-w-md bg-neutral-900 border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover */}
        <div className="relative h-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tour.image || '/placeholder.svg'} alt={tour.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-extrabold text-lg leading-tight">{tour.title}</h3>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-orange-500" />{tour.location}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-orange-500" />{tour.duration}</span>
            <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5 text-orange-500" />{tour.vehicle}</span>
          </div>

          {!joined ? (
            <>
              {/* Scarcity alert */}
              <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/60 to-orange-950/40 p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <CalendarX2 className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-red-300 text-sm leading-snug">
                      Sem horários disponíveis para esta rota nos próximos dias!
                    </p>
                    <p className="text-orange-200/80 text-xs leading-relaxed">
                      Vagas esgotadas devido à alta procura. Entre na lista de espera e seja avisado assim que
                      abrirem novos horários.
                    </p>
                  </div>
                </div>
              </div>

              {/* Waitlist */}
              <div className="space-y-2">
                <label htmlFor="waitlist-email" className="text-xs font-semibold text-neutral-300">
                  Avise-me quando abrir vaga
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                />
                <button
                  onClick={() => email.includes('@') && setJoined(true)}
                  disabled={!email.includes('@')}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-6 py-3 rounded-xl transition"
                >
                  <BellRing className="w-4 h-4" />
                  Entrar na Lista de Espera
                </button>
                <p className="text-center text-[11px] text-neutral-500">
                  Mais de <span className="text-orange-400 font-semibold">240 aventureiros</span> aguardando por esta rota.
                </p>
              </div>
            </>
          ) : (
            <div className="py-6 text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <p className="font-bold text-white">Você está na lista de espera!</p>
              <p className="text-sm text-neutral-400 max-w-xs mx-auto">
                Vamos avisar <span className="text-orange-400">{email}</span> assim que uma vaga for liberada para
                <span className="text-white font-medium"> {tour.title}</span>.
              </p>
              <button
                onClick={onClose}
                className="mt-2 text-sm font-semibold text-neutral-300 hover:text-white transition"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
