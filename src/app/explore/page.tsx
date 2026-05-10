"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  MapPin, Star, Search, X, Loader2, CheckCircle2,
  Globe2, Plus, ChevronRight, Sparkles,
} from "lucide-react";

const POPULAR_DESTINATIONS = [
  { id: "1",  cityName: "Tokyo",      country: "Japan",        region: "Asia",          imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop", popularity: 98, tags: ["Culture", "Food", "Technology"],    description: "An electric city blending ultramodern with ancient tradition." },
  { id: "2",  cityName: "Paris",      country: "France",       region: "Europe",        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop", popularity: 95, tags: ["Romance", "Art", "Architecture"],    description: "The City of Light: Eiffel Tower, world-class cuisine, timeless style." },
  { id: "3",  cityName: "Bali",       country: "Indonesia",    region: "Asia",          imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop", popularity: 92, tags: ["Beaches", "Nature", "Relaxation"],   description: "Tropical paradise with rice terraces, temples, and surf." },
  { id: "4",  cityName: "New York",   country: "USA",          region: "North America", imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop", popularity: 90, tags: ["City Life", "Entertainment", "Shopping"], description: "The city that never sleeps: Broadway, Central Park, iconic skylines." },
  { id: "5",  cityName: "Rome",       country: "Italy",        region: "Europe",        imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop", popularity: 89, tags: ["History", "Food", "Architecture"],   description: "Walk through millennia of history: Colosseum, Vatican, rich pasta." },
  { id: "6",  cityName: "Cape Town",  country: "South Africa", region: "Africa",        imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=800&auto=format&fit=crop", popularity: 85, tags: ["Nature", "Adventure", "Beaches"],    description: "Dramatic Table Mountain, stunning coastlines, vibrant culture." },
  { id: "7",  cityName: "Dubai",      country: "UAE",          region: "Middle East",   imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop", popularity: 88, tags: ["Luxury", "Shopping", "Architecture"], description: "Futuristic skyline, world tallest buildings, and desert adventures." },
  { id: "8",  cityName: "Santorini",  country: "Greece",       region: "Europe",        imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800&auto=format&fit=crop", popularity: 91, tags: ["Romance", "Beaches", "Views"],       description: "Iconic white-washed cliffs, blue domed churches, Aegean sunsets." },
  { id: "9",  cityName: "Goa",        country: "India",        region: "South Asia",    imageUrl: "https://images.unsplash.com/photo-1587922546307-776227941871?q=80&w=800&auto=format&fit=crop", popularity: 83, tags: ["Beaches", "Nightlife", "Food"],      description: "Golden beaches, Portuguese heritage, spicy seafood, vibrant nightlife." },
  { id: "10", cityName: "Bangkok",    country: "Thailand",     region: "Asia",          imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800&auto=format&fit=crop", popularity: 86, tags: ["Food", "Culture", "Nightlife"],      description: "Temples, street food, and lively nightlife in Southeast Asia hub." },
  { id: "11", cityName: "Barcelona",  country: "Spain",        region: "Europe",        imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800&auto=format&fit=crop", popularity: 87, tags: ["Architecture", "Food", "Beaches"],   description: "Gaudi's masterpieces, tapas culture, and Mediterranean coastline." },
  { id: "12", cityName: "Maldives",   country: "Maldives",     region: "South Asia",    imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop", popularity: 93, tags: ["Luxury", "Beaches", "Relaxation"],  description: "Crystal lagoons, overwater bungalows, and pristine coral reefs." },
];

const ALL_REGIONS = ["All", ...Array.from(new Set(POPULAR_DESTINATIONS.map(d => d.region))).sort()];

type Trip = { id: string; name: string };

function AddToTripModal({ destination, onClose }: { destination: typeof POPULAR_DESTINATIONS[0]; onClose: () => void }) {
  const [trips, setTrips]         = useState<Trip[]>([]);
  const [loadingTrips, setLoading] = useState(true);
  const [saving, setSaving]       = useState(false);
  const [savedTripId, setSaved]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/trips").then(r => r.json())
      .then(d => setTrips(Array.isArray(d) ? d : []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const handleAdd = async (tripId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityName: destination.cityName, country: destination.country, arrivalDate: "", departureDate: "" }),
      });
      if (res.ok) setSaved(tripId);
      else alert("Failed to add stop.");
    } catch { /* noop */ }
    finally { setSaving(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 rounded-2xl"><MapPin className="text-indigo-600" size={20} /></div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Add to Trip</h2>
                <p className="text-xs text-slate-400 mt-0.5">Add <strong>{destination.cityName}</strong> as a stop</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"><X size={18} /></button>
          </div>

          <div className="rounded-2xl overflow-hidden mb-5 h-28 relative">
            <img src={destination.imageUrl} alt={destination.cityName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
              <p className="text-white font-bold text-sm">{destination.cityName}, {destination.country}</p>
            </div>
          </div>

          {loadingTrips ? (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin" /><span className="text-sm">Loading your trips…</span>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-8">
              <Globe2 size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium mb-4">No trips yet.</p>
              <Link href="/trips/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors">
                <Plus size={16} /> Create a Trip
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Choose a trip</p>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {trips.map(trip => (
                  <button key={trip.id} onClick={() => handleAdd(trip.id)} disabled={saving || savedTripId === trip.id}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-sm font-semibold ${
                      savedTripId === trip.id
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700"
                    } disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className={savedTripId === trip.id ? "text-emerald-500" : "text-indigo-400"} />
                      {trip.name}
                    </div>
                    {savedTripId === trip.id ? <CheckCircle2 size={16} className="text-emerald-500" /> : saving ? <Loader2 size={14} className="animate-spin text-slate-400" /> : <Plus size={14} className="text-slate-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {savedTripId && (
            <div className="mt-4 flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 text-sm">Done</button>
              <Link href={`/trips/${savedTripId}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-sm">
                View Trip <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ExplorePage() {
  const [query, setQuery]             = useState("");
  const [activeRegion, setRegion]     = useState("All");
  const [selected, setSelected]       = useState<typeof POPULAR_DESTINATIONS[0] | null>(null);
  const [showDropdown, setDrop]       = useState(false);
  const [aiSuggestions, setAiSugg]   = useState<string[]>([]);
  const [aiLoading, setAiLoading]    = useState(false);
  const [aiSource, setAiSource]      = useState<"ai" | "local" | "">("");
  const [aiOnlyName, setAiOnlyName]  = useState<string | null>(null); // name picked from AI that has no local card
  const searchRef  = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Clear AI-only card when query changes
  useEffect(() => { setAiOnlyName(null); }, [query]);

  // Debounced AI suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) {
      setAiSugg([]); setAiLoading(false); return;
    }
    setAiLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        setAiSugg(data.suggestions || []);
        setAiSource(data.source || "");
      } catch {
        setAiSugg([]);
      } finally {
        setAiLoading(false);
      }
    }, 300);
  }, [query]);

  // Local matches for dropdown
  const localMatches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return POPULAR_DESTINATIONS.filter(d =>
      d.cityName.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q)) ||
      d.region.toLowerCase().includes(q)
    );
  }, [query]);

  // AI suggestions that are NOT already in local matches
  const aiOnlySuggestions = useMemo(() => {
    const localNames = new Set(localMatches.map(d => d.cityName.toLowerCase()));
    return aiSuggestions.filter(name => !localNames.has(name.toLowerCase()));
  }, [aiSuggestions, localMatches]);

  // Filtered grid
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return POPULAR_DESTINATIONS.filter(d => {
      const matchRegion = activeRegion === "All" || d.region === activeRegion;
      const matchQuery  = !q ||
        d.cityName.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q)) ||
        d.region.toLowerCase().includes(q);
      return matchRegion && matchQuery;
    });
  }, [query, activeRegion]);

  const handleSelectLocal = (d: typeof POPULAR_DESTINATIONS[0]) => {
    setQuery(d.cityName); setDrop(false); setRegion("All"); setAiOnlyName(null);
  };

  const handleSelectAiOnly = (name: string) => {
    setQuery(name); setDrop(false); setRegion("All"); setAiOnlyName(name);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white pt-32 pb-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 30% 60%, #6366f1, transparent 50%), radial-gradient(circle at 80% 20%, #0ea5e9, transparent 40%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-5 text-xs font-bold">
            <Globe2 size={14} className="text-indigo-300" />
            <span className="text-indigo-200">{POPULAR_DESTINATIONS.length} Destinations Worldwide</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Explore the World</h1>
          <p className="text-slate-400 max-w-lg mx-auto text-base mb-10">
            Discover top destinations and add them to your itinerary in one click.
          </p>

          {/* ── Searchbar ───────────────────────── */}
          <div ref={searchRef} className="relative max-w-2xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setDrop(true); }}
              onFocus={() => setDrop(true)}
              placeholder="Search cities, countries, tags… e.g. Beaches, Europe, Tokyo"
              className="w-full pl-11 pr-10 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
            {query && (
              <button onClick={() => { setQuery(""); setDrop(false); setAiOnlyName(null); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white z-10">
                <X size={16} />
              </button>
            )}

            {/* ── Dropdown ── */}
            {showDropdown && query.trim().length >= 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-20 text-left max-h-80 overflow-y-auto">

                {/* Local destinations first (always shown if they match) */}
                {localMatches.length > 0 && (
                  <>
                    <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin size={10} /> Matching Destinations
                      </span>
                      <span className="text-[10px] text-slate-300 font-semibold">{localMatches.length} found</span>
                    </div>
                    {localMatches.map(d => (
                      <button key={d.id}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left border-b border-slate-50 last:border-0"
                        onClick={() => handleSelectLocal(d)}
                      >
                        <img src={d.imageUrl} alt={d.cityName} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 truncate">{d.cityName}</p>
                          <p className="text-[11px] text-slate-400">{d.country} · {d.region}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 shrink-0">
                          {d.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold">{t}</span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* AI-only suggestions (not already in local) */}
                {(aiOnlySuggestions.length > 0 || aiLoading) && (
                  <>
                    <div className="px-4 py-1.5 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between sticky top-0">
                      <div className="flex items-center gap-1.5 text-indigo-600">
                        <Sparkles size={10} />
                        <span className="text-[10px] font-black uppercase tracking-widest">AI Discovers More</span>
                      </div>
                      {aiLoading && <Loader2 size={11} className="animate-spin text-indigo-400" />}
                    </div>
                    {aiOnlySuggestions.map((name, i) => (
                      <button key={`ai-${i}`}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left border-b border-slate-50"
                        onClick={() => handleSelectAiOnly(name)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shrink-0">
                          <MapPin size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800">{name}</p>
                          <p className="text-[11px] text-slate-400">AI suggested destination</p>
                        </div>
                        <span className="text-[9px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded font-black uppercase tracking-wide shrink-0">AI</span>
                      </button>
                    ))}
                  </>
                )}

                {!aiLoading && localMatches.length === 0 && aiOnlySuggestions.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <Globe2 size={28} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No results for "<strong>{query}</strong>"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-24">

        {/* Region pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ALL_REGIONS.map(region => (
            <button key={region} onClick={() => setRegion(region)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                activeRegion === region
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >{region}</button>
          ))}
        </div>

        {/* Count */}
        <p className="text-sm text-slate-500 font-medium mb-5">
          {filtered.length === 0 && !aiOnlyName
            ? `No destinations found${query ? ` for "${query}"` : ""}`
            : `${filtered.length + (aiOnlyName ? 1 : 0)} destination${filtered.length + (aiOnlyName ? 1 : 0) !== 1 ? "s" : ""}${activeRegion !== "All" ? ` in ${activeRegion}` : ""}`}
        </p>

        {/* ── Card Grid ────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

          {/* AI-discovered card (not in collection) */}
          {aiOnlyName && (
            <div className="group bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl overflow-hidden shadow-lg border border-indigo-500 flex flex-col relative">
              <div className="absolute top-3 right-3 bg-white/20 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-black text-white flex items-center gap-1">
                <Sparkles size={10} /> AI Pick
              </div>
              <div className="h-44 flex items-center justify-center shrink-0">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Globe2 size={32} className="text-white" />
                  </div>
                  <p className="text-white/70 text-xs font-medium">AI Suggested</p>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-1 text-indigo-200 text-xs font-semibold mb-1">
                  <MapPin size={11} /> AI Recommended
                </div>
                <h3 className="text-lg font-black text-white mb-1 leading-tight">{aiOnlyName}</h3>
                <p className="text-indigo-200 text-xs mb-3 flex-1">
                  Discovered by AI based on your search. Add it to your trip to explore!
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  <span className="px-2 py-0.5 bg-white/20 text-white rounded-lg text-[10px] font-semibold">AI Pick</span>
                </div>
                <button
                  onClick={() => setSelected({
                    id: "ai-" + aiOnlyName,
                    cityName: aiOnlyName,
                    country: "",
                    region: "AI Suggested",
                    imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(aiOnlyName)},travel`,
                    popularity: 0,
                    tags: ["AI Pick"],
                    description: `AI suggested destination: ${aiOnlyName}`,
                  })}
                  className="mt-auto w-full py-2.5 bg-white text-indigo-700 font-black rounded-xl flex justify-center items-center gap-2 text-sm hover:bg-indigo-50 transition-colors"
                >
                  <Plus size={15} /> Add to Trip
                </button>
              </div>
            </div>
          )}

          {/* Regular destination cards */}
          {filtered.map(dest => (
            <div key={dest.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col"
            >
              <div className="h-44 relative overflow-hidden shrink-0">
                <img src={dest.imageUrl} alt={dest.cityName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={11} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-slate-800">{dest.popularity}</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-white">
                  {dest.region}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-1 text-indigo-600 text-xs font-semibold mb-1">
                  <MapPin size={11} />{dest.country}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors leading-tight">
                  {dest.cityName}
                </h3>
                <p className="text-slate-500 text-xs mb-3 line-clamp-2 leading-relaxed flex-1">{dest.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {dest.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-semibold">{tag}</span>
                  ))}
                </div>
                <button onClick={() => setSelected(dest)}
                  className="mt-auto w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 text-sm shadow-sm shadow-indigo-200 transition-colors">
                  <Plus size={15} /> Add to Trip
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !aiOnlyName && (
          <div className="text-center py-20">
            <Globe2 size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No destinations match your search.</p>
            <button onClick={() => { setQuery(""); setRegion("All"); }}
              className="mt-4 text-indigo-600 text-sm font-bold hover:underline">Clear filters</button>
          </div>
        )}
      </div>

      {selected && <AddToTripModal destination={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

