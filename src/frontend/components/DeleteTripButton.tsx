"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";

function DeleteModal({
  tripName,
  loading,
  onClose,
  onConfirm,
}: {
  tripName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText.trim().toLowerCase() === tripName.trim().toLowerCase();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loading, onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Red top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-pink-600" />

        <div className="p-7">
          {/* Icon + Title */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertTriangle className="text-rose-600" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Delete Trip</h2>
                <p className="text-sm text-slate-400 mt-0.5">This cannot be undone</p>
              </div>
            </div>
            <button
              onClick={() => !loading && onClose()}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Warning body */}
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-5">
            <p className="text-sm text-rose-700 leading-relaxed">
              You are about to permanently delete{" "}
              <strong className="font-bold">"{tripName}"</strong> along with all its stops,
              activities, expenses, and packing items. This action{" "}
              <strong>cannot be reversed</strong>.
            </p>
          </div>

          {/* Confirmation input */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              Type the trip name to confirm
            </label>
            <input
              type="text"
              placeholder={tripName}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-medium"
              disabled={loading}
              autoFocus
            />
            {confirmText && !isConfirmed && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">
                Name doesn't match — check the spelling.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!isConfirmed || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-lg shadow-rose-200"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Deleting...</>
              ) : (
                <><Trash2 size={16} /> Delete Forever</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function DeleteTripButton({
  tripId,
  tripName,
}: {
  tripId: string;
  tripName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        alert("Failed to delete trip. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Delete Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 glass rounded-2xl text-rose-200 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all border-rose-500/20"
      >
        <Trash2 size={16} /> Delete
      </button>

      {/* Portal Modal — rendered outside overflow-hidden parents */}
      {isOpen && (
        <DeleteModal
          tripName={tripName}
          loading={loading}
          onClose={() => !loading && setIsOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
