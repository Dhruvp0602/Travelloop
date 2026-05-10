"use client";

import { useState, useMemo } from "react";
import { Plus, X, MapPin, Calendar, Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExistingStop {
  id: string;
  cityName: string;
  arrivalDate: string | null;
  departureDate: string | null;
}

interface ConflictResult {
  hasConflict: boolean;
  message: string;
  conflictingStop?: string;
  type: "error" | "warning" | "success" | "info";
}

function checkDateConflict(
  arrival: string,
  departure: string,
  existingStops: ExistingStop[]
): ConflictResult {
  if (!arrival && !departure) {
    return { hasConflict: false, message: "", type: "info" };
  }

  const newArrival   = arrival   ? new Date(arrival)   : null;
  const newDeparture = departure ? new Date(departure) : null;

  // Departure must be after arrival
  if (newArrival && newDeparture && newDeparture <= newArrival) {
    return {
      hasConflict: true,
      message: "Departure date must be after arrival date.",
      type: "error",
    };
  }

  // Check for overlaps with existing stops
  for (const stop of existingStops) {
    if (!stop.arrivalDate && !stop.departureDate) continue;

    const existArrival   = stop.arrivalDate   ? new Date(stop.arrivalDate)   : null;
    const existDeparture = stop.departureDate ? new Date(stop.departureDate) : null;

    // Overlap check: new arrival falls inside an existing stop's range
    if (newArrival && existArrival && existDeparture) {
      if (newArrival >= existArrival && newArrival < existDeparture) {
        return {
          hasConflict: true,
          message: `Your arrival date overlaps with your stay in ${stop.cityName} (${existArrival.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${existDeparture.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}).`,
          conflictingStop: stop.cityName,
          type: "error",
        };
      }
    }

    // New departure falls inside an existing stop's range
    if (newDeparture && existArrival && existDeparture) {
      if (newDeparture > existArrival && newDeparture <= existDeparture) {
        return {
          hasConflict: true,
          message: `Your departure date overlaps with your stay in ${stop.cityName} (${existArrival.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${existDeparture.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}).`,
          conflictingStop: stop.cityName,
          type: "error",
        };
      }
    }

    // New range completely wraps an existing stop
    if (newArrival && newDeparture && existArrival && existDeparture) {
      if (newArrival <= existArrival && newDeparture >= existDeparture) {
        return {
          hasConflict: true,
          message: `These dates completely overlap your planned stay in ${stop.cityName}.`,
          conflictingStop: stop.cityName,
          type: "error",
        };
      }
    }

    // Adjacent dates warning (same day departure/arrival — tight!)
    if (newArrival && existDeparture) {
      const sameDay = newArrival.toDateString() === existDeparture.toDateString();
      if (sameDay) {
        return {
          hasConflict: false,
          message: `This arrival is the same day as your departure from ${stop.cityName}. That's a tight connection — make sure you have enough travel time!`,
          conflictingStop: stop.cityName,
          type: "warning",
        };
      }
    }
  }

  if (newArrival && newDeparture) {
    const nights = Math.round((newDeparture.getTime() - newArrival.getTime()) / (1000 * 60 * 60 * 24));
    return {
      hasConflict: false,
      message: `✓ Dates look great! ${nights} night${nights !== 1 ? "s" : ""} — no conflicts with your itinerary.`,
      type: "success",
    };
  }

  return { hasConflict: false, message: "", type: "info" };
}

export default function AddStopForm({
  tripId,
  existingStops = [],
  tripStartDate,
  tripEndDate,
}: {
  tripId: string;
  existingStops?: ExistingStop[];
  tripStartDate?: string;
  tripEndDate?: string;
}) {
  const [isOpen, setIsOpen]   = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Smart default: start from the day after the last stop ends, or fall back to trip start
  const lastStopEnd = existingStops
    .map(s => s.departureDate)
    .filter(Boolean)
    .sort()
    .at(-1);

  const defaultArrival = lastStopEnd
    ? lastStopEnd.slice(0, 10)            // day after last stop departure
    : tripStartDate
    ? tripStartDate.slice(0, 10)
    : "";

  const defaultDeparture = tripEndDate ? tripEndDate.slice(0, 10) : "";

  const [formData, setFormData] = useState({
    cityName: "",
    country: "",
    arrivalDate: defaultArrival,
    departureDate: defaultDeparture,
  });

  // Live conflict detection
  const conflict: ConflictResult = useMemo(() => {
    return checkDateConflict(formData.arrivalDate, formData.departureDate, existingStops);
  }, [formData.arrivalDate, formData.departureDate, existingStops]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (conflict.hasConflict) return; // Block submission on conflict
    setLoading(true);

    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsOpen(false);
        setFormData({ cityName: "", country: "", arrivalDate: defaultArrival, departureDate: defaultDeparture });
        router.refresh();
      } else {
        alert("Failed to add stop");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md text-sm"
      >
        <Plus size={16} />
        Add Stop
      </button>
    );
  }

  const conflictBanner: Record<ConflictResult["type"], { bg: string; border: string; text: string; icon: React.ElementType }> = {
    error:   { bg: "bg-rose-50",   border: "border-rose-200",   text: "text-rose-700",   icon: AlertTriangle  },
    warning: { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  icon: AlertTriangle  },
    success: { bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700",icon: CheckCircle2   },
    info:    { bg: "bg-slate-50",  border: "border-slate-200",  text: "text-slate-600",  icon: Info           },
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-lg mb-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
            <MapPin size={18} className="text-indigo-600" />
          </div>
          Add New Destination
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Trip date range hint */}
      {(tripStartDate || tripEndDate) && (
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 mb-4">
          <Calendar size={14} className="text-indigo-500 shrink-0" />
          <p className="text-xs text-indigo-700 font-medium">
            Trip runs {tripStartDate ? new Date(tripStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
            {" to "}
            {tripEndDate ? new Date(tripEndDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* City & Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">City Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Paris"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={formData.cityName}
              onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Country</label>
            <input
              required
              type="text"
              placeholder="e.g. France"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Arrival Date</label>
            <input
              type="date"
              min={tripStartDate || undefined}
              max={formData.departureDate || tripEndDate || undefined}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                conflict.type === "error" && formData.arrivalDate
                  ? "border-rose-300 bg-rose-50"
                  : "border-slate-200"
              }`}
              value={formData.arrivalDate}
              onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Departure Date</label>
            <input
              type="date"
              min={formData.arrivalDate || tripStartDate || undefined}
              max={tripEndDate || undefined}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                conflict.type === "error" && formData.departureDate
                  ? "border-rose-300 bg-rose-50"
                  : "border-slate-200"
              }`}
              value={formData.departureDate}
              onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
            />
          </div>
        </div>

        {/* Existing stops timeline hint */}
        {existingStops.length > 0 && (
          <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
            <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Existing Stops</p>
            <div className="flex flex-wrap gap-2">
              {existingStops.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-1 text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-lg">
                  <MapPin size={10} className="text-indigo-600" />
                  {s.cityName}
                  {s.arrivalDate && s.departureDate && (
                    <span className="text-slate-400 font-normal">
                      {" "}({new Date(s.arrivalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {new Date(s.departureDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })})
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Conflict / Status Banner */}
        {conflict.message && (() => {
          const { bg, border, text, icon: Icon } = conflictBanner[conflict.type];
          return (
            <div className={`flex items-start gap-3 ${bg} border ${border} rounded-xl px-4 py-3`}>
              <Icon size={16} className={`${text} mt-0.5 shrink-0`} />
              <p className={`text-xs font-medium ${text} leading-relaxed`}>{conflict.message}</p>
            </div>
          );
        })()}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || conflict.hasConflict}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Save Stop
          </button>
        </div>
      </form>
    </div>
  );
}
