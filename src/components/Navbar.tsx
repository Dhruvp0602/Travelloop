"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { MapPin, Plane, Menu, UserCircle, LogOut } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <Plane size={24} />
              </div>
              <span className="font-bold text-2xl text-slate-800 tracking-tight">
                Traveloop
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/explore" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Explore</Link>
            
            {session ? (
              <>
                <Link href="/dashboard" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">My Trips</Link>
                <div className="flex items-center gap-4 ml-4">
                  <span className="text-sm text-slate-500">Hi, {session.user?.name}</span>
                  <button 
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition-colors font-medium"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">
                  Log in
                </Link>
                <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-indigo-600 focus:outline-none"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4">
          <Link href="/explore" className="block text-slate-600 font-medium">Explore</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="block text-slate-600 font-medium">My Trips</Link>
              <button 
                onClick={() => signOut()}
                className="block text-slate-600 font-medium w-full text-left"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-slate-600 font-medium">Log in</Link>
              <Link href="/register" className="block text-indigo-600 font-medium">Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
