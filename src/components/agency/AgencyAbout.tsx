import { BookOpen, Lightbulb } from 'lucide-react';
import type { Agency } from '@/types/database';

export default function AgencyAbout({ agency }: { agency: Agency }) {
  if (!agency.description && !agency.local_curiosities) return null;
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {agency.description && (
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />Nossa História
          </h2>
          <p className="text-stone-600 leading-relaxed">{agency.description}</p>
        </div>
      )}
      {agency.local_curiosities && (
        <div className="space-y-3 bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" />Curiosidades Locais
          </h2>
          <p className="text-stone-600 leading-relaxed">{agency.local_curiosities}</p>
        </div>
      )}
    </section>
  );
}
