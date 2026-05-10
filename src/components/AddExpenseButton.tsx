"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Receipt, X, Loader2, Plus, CreditCard, Hotel,
  Utensils, Car, Ticket, ShoppingBag, DollarSign,
} from "lucide-react";

const CATEGORIES = [
  { label: "Flights",    icon: CreditCard,  color: "bg-sky-100 text-sky-600 border-sky-200"    },
  { label: "Hotels",     icon: Hotel,       color: "bg-violet-100 text-violet-600 border-violet-200" },
  { label: "Food",       icon: Utensils,    color: "bg-amber-100 text-amber-600 border-amber-200"   },
  { label: "Transport",  icon: Car,         color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  { label: "Activities", icon: Ticket,      color: "bg-rose-100 text-rose-600 border-rose-200"   },
  { label: "Shopping",   icon: ShoppingBag, color: "bg-pink-100 text-pink-600 border-pink-200"   },
  { label: "Other",      icon: DollarSign,  color: "bg-slate-100 text-slate-600 border-slate-200" },
];

function AddExpenseModal({
  tripId,
  onClose,
  onSuccess,
}: {
  tripId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.amount) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Failed to add expense. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

        <div className="p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Receipt className="text-emerald-600" size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Add Expense</h2>
                <p className="text-xs text-slate-400 mt-0.5">Track your spending</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map(({ label, icon: Icon, color }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setForm({ ...form, category: label })}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all text-xs font-bold ${
                      form.category === label
                        ? color + " border-current scale-105 shadow-sm"
                        : "bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="leading-none">{label}</span>
                  </button>
                ))}
              </div>
              {!form.category && <p className="text-xs text-slate-400 mt-1.5">Select a category above</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">₹</span>
                <input
                  required
                  type="number"
                  min="1"
                  step="any"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Description</label>
              <input
                type="text"
                placeholder="e.g. Indigo flight BOM to CDG"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !form.category || !form.amount}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-lg shadow-emerald-200"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  : <><Plus size={16} /> Add Expense</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AddExpenseButton({ tripId }: { tripId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-900/30"
      >
        <Receipt size={18} /> Add Expense
      </button>

      {isOpen && (
        <AddExpenseModal
          tripId={tripId}
          onClose={() => setIsOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}
