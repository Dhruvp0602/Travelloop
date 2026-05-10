"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Plane, Menu, LogOut, Compass, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering session-dependent parts until mounted
  const isAuthenticated = mounted && status === "authenticated" && session;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-5xl">
      <div className="glass border border-white/40 rounded-[2rem] px-6 py-3 shadow-2xl shadow-indigo-100/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-slate-900 p-2 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300">
                <Plane size={20} className="group-hover:rotate-12 transition-transform" />
              </div>
              <span className="font-black text-xl text-slate-900 tracking-tighter">
                TRAVELOOP.
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/explore" className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all text-sm font-bold">
               <Compass size={16} /> Explore
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all text-sm font-bold">
                   <Briefcase size={16} /> My Trips
                </Link>
                
                <div className="h-6 w-[1px] bg-slate-200 mx-2" />
                
                <div className="flex items-center gap-3 pl-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Traveller</span>
                    <span className="text-xs font-bold text-slate-900">{session?.user?.name}</span>
                  </div>
                  <button 
                    onClick={() => signOut()}
                    className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : mounted && status !== "loading" ? (
              <div className="flex items-center gap-2 ml-4">
                <Link href="/login" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-sm font-bold">
                  Login
                </Link>
                <Link href="/register" className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-100">
                  Join Now
                </Link>
              </div>
            ) : (
              <div className="w-20" /> // Spacer during loading
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl focus:outline-none"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mounted && isOpen && (
        <div className="md:hidden mt-2 glass border border-white/40 rounded-[2rem] p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <Link href="/explore" className="flex items-center gap-3 text-slate-900 font-bold">
             <Compass size={20} /> Explore
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-3 text-slate-900 font-bold">
                 <Briefcase size={20} /> My Trips
              </Link>
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-3 text-rose-500 font-bold w-full text-left"
              >
                <LogOut size={20} /> Log out
              </button>
            </>
          ) : status !== "loading" && (
            <>
              <Link href="/login" className="block text-slate-900 font-bold">Log in</Link>
              <Link href="/register" className="block px-6 py-3 bg-slate-900 text-white rounded-2xl text-center font-black">Join Now</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
