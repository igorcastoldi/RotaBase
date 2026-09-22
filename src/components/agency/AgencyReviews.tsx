'use client';
import { Star } from 'lucide-react';
import Image from 'next/image';
import type { Review } from '@/types/database';

interface Props {
  reviews: Review[];
  avgRating: number;
  totalReviews: number;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-stone-300 fill-stone-300'}`}
        />
      ))}
    </div>
  );
}

export default function AgencyReviews({ reviews, avgRating, totalReviews }: Props) {
  return (
    <section id="avaliacoes" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-stone-800">Avaliações</h2>
        {totalReviews > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-2">
            <span className="text-4xl font-extrabold text-amber-600">{avgRating.toFixed(1)}</span>
            <div>
              <StarDisplay rating={Math.round(avgRating)} />
              <p className="text-stone-500 text-sm mt-0.5">{totalReviews} avaliações verificadas</p>
            </div>
          </div>
        )}
      </div>

      {/* Cards */}
      {reviews.length === 0 ? (
        <p className="text-stone-500">Ainda não há avaliações. Seja o primeiro!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 space-y-2">
              {/* Cliente */}
              <div className="flex items-center gap-3">
                {review.client?.avatar_url ? (
                  <Image
                    src={review.client.avatar_url}
                    alt={review.client.full_name}
                    width={36} height={36}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                    {review.client?.full_name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{review.client?.full_name}</p>
                  {review.is_verified && (
                    <span className="text-green-600 text-xs font-medium">✓ Compra verificada</span>
                  )}
                </div>
                <div className="ml-auto">
                  <StarDisplay rating={review.rating} />
                </div>
              </div>

              {/* Comentário */}
              {review.comment && (
                <p className="text-stone-700 text-sm leading-relaxed">{review.comment}</p>
              )}

              {/* Resposta da agência */}
              {review.agency_reply && (
                <div className="bg-amber-50 rounded-xl p-3 border-l-4 border-amber-400">
                  <p className="text-amber-800 text-xs font-semibold mb-1">Resposta da empresa:</p>
                  <p className="text-amber-900 text-sm">{review.agency_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
