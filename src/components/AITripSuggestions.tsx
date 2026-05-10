"use client";

import { useState } from "react";
import { Sparkles, Loader2, Info, MapPin, Navigation } from "lucide-react";

export default function AITripSuggestions({ tripName, tripId }: { tripName: string; tripId: string }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/ai-suggestions`);
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 shadow-sm border border-indigo-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
          <Sparkles size={24} />
        </div>
        <h3 className="font-bold text-slate-900">AI Trip Assistant</h3>
      </div>
      
      {!suggestions ? (
        <div>
          <p className="text-sm text-slate-600 mb-4">
            Get personalized activity ideas, packing suggestions, and estimated costs for <strong>{tripName}</strong> powered by AI.
          </p>
          <button 
            onClick={fetchSuggestions}
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? "Generating..." : "Generate Insights"}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in-up">
          {suggestions.primaryDestination && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <h4 className="text-sm font-bold text-indigo-700 mb-2">Primary Destination</h4>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-indigo-500" />
                <span className="text-lg font-bold text-slate-900">{suggestions.primaryDestination}</span>
              </div>
            </div>
          )}

          {suggestions.nearbyCities && suggestions.nearbyCities.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <h4 className="text-sm font-bold text-teal-700 mb-3">Nearby Destinations to Consider</h4>
              <div className="space-y-3">
                {suggestions.nearbyCities.map((city: any, i: number) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="font-bold text-slate-900 text-sm">{city.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Navigation size={12} className="text-teal-500" /> {city.distance}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 italic">{city.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h4 className="text-sm font-bold text-indigo-700 mb-2">Estimated Total Cost</h4>
            <div className="text-2xl font-black text-slate-900">{suggestions.estimatedCost}</div>
            
            {suggestions.expenseBreakdown && (
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-slate-500 text-xs font-semibold mb-1">Estimated Flights</div>
                  <div className="font-bold text-slate-800">{suggestions.expenseBreakdown.flightCost}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-slate-500 text-xs font-semibold mb-1">Estimated Hotels</div>
                  <div className="font-bold text-slate-800">{suggestions.expenseBreakdown.hotelCost}</div>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
              <Info size={12} /> Based on regional averages for 2 people
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h4 className="text-sm font-bold text-purple-700 mb-2">Top Activity Ideas</h4>
            <ul className="space-y-2">
              {suggestions.activities.map((act: string, i: number) => (
                <li key={i} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-purple-400">•</span> {act}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h4 className="text-sm font-bold text-cyan-700 mb-2">Smart Packing Tips</h4>
            <ul className="space-y-2">
              {suggestions.packing.map((item: string, i: number) => (
                <li key={i} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-cyan-400">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
