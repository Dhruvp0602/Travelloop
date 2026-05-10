"use client";

import { useState, useRef } from "react";
import {
  Sparkles, Loader2, Info, MapPin, Navigation, Plane,
  Hotel, Utensils, RefreshCw, ChevronDown, ChevronUp,
  Wallet, Route,
} from "lucide-react";

interface Stop { cityName: string; country: string; }

export default function AITripSuggestions({
  tripId,
  stops = [],
}: {
  tripName: string;
  tripId: string;
  stops?: Stop[];
}) {
  const [loading, setLoading]       = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [homeCity, setHomeCity]     = useState("");
  const [error, setError]           = useState("");
  const [expanded, setExpanded]     = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const toggle = (key: string) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const fetchSuggestions = async () => {
    if (!homeCity.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/trips/${tripId}/ai-suggestions?homeCity=${encodeURIComponent(homeCity)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuggestions(data);
    } catch (err: any) {
      setError(err.message || "Failed to get suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchSuggestions();
  };

  const stopList = stops.map(s => s.cityName).join(" → ");

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 rounded-3xl border border-indigo-100 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-indigo-100 bg-white/60 backdrop-blur-sm">
        <div className="p-2 bg-indigo-100 rounded-xl">
          <Sparkles size={20} className="text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-slate-900 text-sm">AI Trip Assistant</h3>
          {stops.length > 0 && (
            <p className="text-xs text-slate-600 truncate mt-0.5">{stopList}</p>
          )}
        </div>
        {suggestions && (
          <button
            onClick={() => { setSuggestions(null); setError(""); }}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            <RefreshCw size={13} /> Reset
          </button>
        )}
      </div>

      <div className="p-5">
        {!suggestions ? (
          <div className="space-y-4">
            {/* Route preview */}
            {stops.length > 0 && (
              <div className="bg-white rounded-2xl p-3 border border-indigo-100">
                <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-2">Planned Route</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {stops.map((s, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-lg">{s.cityName}</span>
                      {i < stops.length - 1 && <span className="text-slate-300 text-xs">→</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-slate-600 leading-relaxed">
              Get AI-powered cost estimates and specific activity suggestions for each of your {stops.length} stops.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Your Starting City
              </label>
              <input
                ref={inputRef}
                type="text"
                placeholder="e.g. Mumbai, New York, London"
                className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                value={homeCity}
                onChange={e => setHomeCity(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

            <button
              onClick={fetchSuggestions}
              disabled={loading || !homeCity.trim()}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 text-sm"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? "Planning Your Trip…" : "Plan Trip with AI"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* ── Total Cost ─────────────────── */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet size={16} className="text-indigo-500" />
                  <span className="text-sm font-black text-slate-900">Estimated Total</span>
                </div>
                <span className="text-xl font-black text-indigo-600">{suggestions.estimatedCost}</span>
              </div>

              {suggestions.expenseBreakdown?.travelCosts?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggle("travel")}>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                      <Route size={11} /> Travel Breakdown
                    </span>
                    {expanded.travel ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
                  </div>

                  {expanded.travel !== false && (
                    <div className="space-y-1.5">
                      {suggestions.expenseBreakdown.travelCosts.map((r: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded-xl">
                          <div className="flex items-center gap-2 min-w-0">
                            <Plane size={12} className="text-indigo-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-slate-800 truncate">{r.route}</p>
                              <span className="text-[9px] text-indigo-500 font-semibold uppercase">{r.mode}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-rose-600 shrink-0 ml-2">{r.estimatedCost}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Per-Night & Daily Costs ────────────── */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <Hotel size={13} className="text-violet-500" />
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Hotel</span>
                </div>
                <p className="text-xs font-black text-slate-900">{suggestions.expenseBreakdown?.hotelCostPerNight}</p>
              </div>
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <Utensils size={13} className="text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Daily</span>
                </div>
                <p className="text-xs font-black text-slate-900">{suggestions.expenseBreakdown?.dailyOtherCost}</p>
              </div>
            </div>

            {/* ── Per-Stop Suggestions ─────────────────── */}
            {suggestions.stops?.map((stop: any, idx: number) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-black text-indigo-700 bg-slate-50/50"
                  onClick={() => toggle(`stop-${idx}`)}
                >
                  <span className="flex items-center gap-2">
                    <MapPin size={14} className="text-indigo-500" />
                    {stop.cityName}
                  </span>
                  {expanded[`stop-${idx}`] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                
                {expanded[`stop-${idx}`] !== false && (
                  <div className="p-4 space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Sparkles size={10} className="text-amber-500" /> Activities
                      </h4>
                      <ul className="space-y-1.5">
                        {stop.activities?.map((a: string, ai: number) => (
                          <li key={ai} className="text-[11px] text-slate-700 flex gap-2">
                            <span className="text-indigo-300 font-black">•</span> {a}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {stop.nearbyCities?.length > 0 && (
                      <div className="pt-3 border-t border-slate-50">
                        <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Navigation size={10} className="text-teal-500" /> Side Trips
                        </h4>
                        <div className="space-y-2">
                          {stop.nearbyCities.map((c: any, ci: number) => (
                            <div key={ci} className="bg-teal-50/50 p-2 rounded-xl">
                              <p className="text-[10px] font-bold text-slate-800">{c.name} ({c.distance})</p>
                              <p className="text-[9px] text-slate-700 mt-0.5 line-clamp-1">{c.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* ── Packing ───────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-black text-cyan-700"
                onClick={() => toggle("packing")}
              >
                <span className="flex items-center gap-2">🎒 Packing Tips</span>
                {expanded.packing ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {expanded.packing && (
                <ul className="px-4 pb-3 space-y-1.5 border-t border-slate-50">
                  {suggestions.packing?.map((p: string, i: number) => (
                    <li key={i} className="text-[11px] text-slate-700 flex gap-2">
                      <span className="text-cyan-400 font-black">•</span> {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-[10px] text-slate-600 flex items-center gap-1 px-1">
              <Info size={11} /> AI estimates — actual prices may vary
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
