"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Camera, IndianRupee, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddActivityButtonProps {
  tripId: string;
  stopId: string;
  cityName: string;
  theme: {
    gradient: string;
    text: string;
    light: string;
    border: string;
  };
}

export default function AddActivityButton({ tripId, stopId, cityName, theme }: AddActivityButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [type, setType] = useState("Sightseeing");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const activityTypes = [
    { name: "Sightseeing", icon: Camera, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Food & Drink", icon: Sparkles, color: "text-orange-500", bg: "bg-orange-50" },
    { name: "Adventure", icon: Sparkles, color: "text-rose-500", bg: "bg-rose-50" },
    { name: "Relaxation", icon: Sparkles, color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "Culture", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          cost: Number(cost) || 0,
          stopId,
          type,
        }),
      });

      if (res.ok) {
        setName("");
        setCost("");
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${theme.light} rounded-xl`}>
                  <Camera size={24} className={theme.text} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Add Activity</h3>
                  <p className="text-xs text-slate-600 font-medium">What's the plan in {cityName}?</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">Activity Name</label>
                <div className="relative">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Scuba Diving, Eiffel Tower Tour"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">Category</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {activityTypes.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setType(t.name)}
                      className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        type === t.name 
                          ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" 
                          : "bg-white text-slate-600 border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">Estimated Cost</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className={`flex-[2] py-3 bg-gradient-to-r ${theme.gradient} text-white rounded-2xl text-sm font-black shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2`}
            >
              {loading ? "Adding..." : <><Plus size={18} /> Add Activity</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`w-full mt-3 py-2.5 border-2 border-dashed ${theme.border} ${theme.text} text-xs font-bold rounded-2xl hover:${theme.light} transition-colors flex items-center justify-center gap-1.5`}
      >
        <Plus size={14} /> Add Activity
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
