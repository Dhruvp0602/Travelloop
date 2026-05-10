"use client";

import { useState } from "react";
import { Plus, X, MapPin, Calendar, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddStopForm({ tripId }: { tripId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    cityName: "",
    country: "",
    arrivalDate: "",
    departureDate: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsOpen(false);
        setFormData({ cityName: "", country: "", arrivalDate: "", departureDate: "" });
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
        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md"
      >
        <Plus size={18} />
        Add Stop
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-md mb-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <MapPin size={20} className="text-indigo-500" />
          Add New Destination
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">City Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Paris"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.cityName}
              onChange={(e) => setFormData({...formData, cityName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Country</label>
            <input 
              required
              type="text" 
              placeholder="e.g. France"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Arrival Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.arrivalDate}
              onChange={(e) => setFormData({...formData, arrivalDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Departure Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.departureDate}
              onChange={(e) => setFormData({...formData, departureDate: e.target.value})}
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Save Stop
          </button>
        </div>
      </form>
    </div>
  );
}
