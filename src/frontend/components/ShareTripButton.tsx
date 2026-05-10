"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Share2, Copy, Check, Globe, Lock, X, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface ShareTripButtonProps {
  tripId: string;
  initialShareToken: string | null;
  initialIsPublic: boolean;
}

export default function ShareTripButton({ tripId, initialShareToken, initialIsPublic }: ShareTripButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [token, setToken] = useState(initialShareToken);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const shareUrl = mounted && typeof window !== "undefined" 
    ? `${window.location.origin}/share/${token}` 
    : "";

  const toggleShare = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/share`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        setToken(data.shareToken);
        setIsPublic(data.isPublic);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => {
      // Use a local check if still mounted if needed, but for simple toggle it's usually fine
      setCopied(false);
    }, 2000);
  };

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Share2 size={24} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Share Trip</h3>
                <p className="text-xs text-slate-600 font-medium">Manage visibility and share link</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <div className="p-2 bg-emerald-100 rounded-lg"><Globe size={18} className="text-emerald-600" /></div>
                ) : (
                  <div className="p-2 bg-slate-200 rounded-lg"><Lock size={18} className="text-slate-600" /></div>
                )}
                <div>
                  <div className="text-sm font-bold text-slate-900">{isPublic ? "Public Access" : "Private Trip"}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    {isPublic ? "Anyone with the link can view" : "Only you can see this trip"}
                  </div>
                </div>
              </div>
              <button 
                onClick={toggleShare}
                disabled={loading}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                  isPublic 
                    ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200"
                }`}
              >
                {loading ? "..." : isPublic ? "Stop Sharing" : "Enable Sharing"}
              </button>
            </div>

            {isPublic && token && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">Shareable Link</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 truncate">
                    {shareUrl}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0 shadow-lg shadow-slate-200"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <a 
                  href={shareUrl || "#"} 
                  target="_blank" 
                  className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors pt-2"
                >
                  <ExternalLink size={14} /> Preview Share Page
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
          <button 
            onClick={() => setIsOpen(false)}
            className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 glass rounded-2xl text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all border-white/10"
      >
        <Share2 size={16} /> Share
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
