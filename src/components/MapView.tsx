"use client";

import { useState } from "react";
import { Map, MapPin, X } from "lucide-react";

export default function MapView({ cityName, country }: { cityName: string; country: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // Use Google Maps embed URL which doesn't require an API key for basic query
  const query = encodeURIComponent(`${cityName}, ${country}`);
  const mapUrl = `https://maps.google.com/maps?q=${query}&t=m&z=12&ie=UTF8&iwloc=&output=embed`;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-xs font-bold transition-colors"
      >
        <Map size={14} />
        Map View
      </button>
    );
  }

  return (
    <div className="mb-5 relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 bg-white/90 backdrop-blur shadow-sm text-slate-600 hover:text-rose-600 hover:bg-white rounded-xl transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <div className="w-full h-56 bg-slate-100 flex items-center justify-center">
        {/* Loading state before iframe mounts */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
          <MapPin className="animate-bounce mb-2" size={24} />
          <span className="text-xs font-bold uppercase tracking-widest">Loading Map</span>
        </div>
        <iframe
          title={`Map of ${cityName}`}
          width="100%"
          height="100%"
          className="relative z-10 border-0"
          loading="lazy"
          allowFullScreen
          src={mapUrl}
        />
      </div>
    </div>
  );
}
