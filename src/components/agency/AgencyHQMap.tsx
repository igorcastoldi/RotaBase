'use client';
import { useEffect, useRef } from 'react';
import { MapPin, Navigation, Map } from 'lucide-react';
import type { Agency } from '@/types/database';

interface Props { agency: Agency }

export default function AgencyHQMap({ agency }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || !agency.hq_lat || !agency.hq_lng) return;

    let mapInstance: any = null;

    // Leaflet (sem API Key - OpenStreetMap)
    import('leaflet').then((L) => {
      // Evitar dupla inicialização em strict mode
      if (!mapRef.current || mapRef.current.innerHTML !== '') return;
      mapInstance = L.map(mapRef.current).setView([agency.hq_lat!, agency.hq_lng!], 15);
      L.tileLayer('https://upload.wikimedia.org/wikipedia/commons/0/03/Tiled_web_map_Stevage.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstance);
      L.marker([agency.hq_lat!, agency.hq_lng!])
        .addTo(mapInstance)
        .bindPopup(`<b>${agency.hq_name ?? agency.name}</b><br>${agency.hq_address ?? ''}`)
        .openPopup();
    });

    return () => {
      if (mapInstance) mapInstance.remove();
    };
  }, [agency]);

  if (!agency.hq_lat || !agency.hq_lng) return null;

  return (
    <section id="sede" className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-6 h-6 text-amber-600" />
        <h2 className="text-2xl font-bold text-stone-800">Nossa Sede — Ponto de Partida</h2>
      </div>

      {agency.hq_address && (
        <p className="text-stone-600 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-stone-400" />
          {agency.hq_address}
        </p>
      )}

      {/* Mapa Leaflet */}
      <div
        ref={mapRef}
        className="w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-md z-0"
        style={{ minHeight: 256 }}
      />

      {/* Botões de Navegação */}
      <div className="flex flex-wrap gap-3">
        {agency.hq_google_maps_url && (
          <a
            href={agency.hq_google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow transition"
          >
            <Map className="w-5 h-5" />
            Abrir no Google Maps
          </a>
        )}
        {agency.hq_waze_url && (
          <a
            href={agency.hq_waze_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow transition"
          >
            <Navigation className="w-5 h-5" />
            Abrir no Waze
          </a>
        )}
      </div>
    </section>
  );
}
