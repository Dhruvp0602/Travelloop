"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, MapPin } from "lucide-react";
import Link from "next/link";

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    isPublic: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create trip");
      
      const trip = await res.json();
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <MapPin size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Plan a New Trip</h1>
              <p className="text-slate-500">Start your adventure by filling in the details below.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Trip Name</label>
              <input
                type="text"
                required
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg font-medium"
                placeholder="e.g., Summer in Europe, Tokyo Adventure"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                <input
                  type="date"
                  required
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={data.startDate}
                  onChange={(e) => setData({ ...data, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                <input
                  type="date"
                  required
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={data.endDate}
                  onChange={(e) => setData({ ...data, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description (Optional)</label>
              <textarea
                rows={4}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                placeholder="What is this trip about?"
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="isPublic"
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                checked={data.isPublic}
                onChange={(e) => setData({ ...data, isPublic: e.target.checked })}
              />
              <label htmlFor="isPublic" className="block text-sm font-medium text-slate-700 cursor-pointer">
                Make this trip public
                <span className="block text-xs font-normal text-slate-500 mt-0.5">
                  Anyone with the link will be able to view this itinerary.
                </span>
              </label>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={20} />
                    Create Trip & Start Planning
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
