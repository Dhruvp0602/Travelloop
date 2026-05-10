import { prisma } from "@/backend/lib/prisma";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Navigation, Clock, Ticket, Globe, Star, Camera } from "lucide-react";
import Link from "next/link";

const stopGradients = [
  { gradient: "from-indigo-500 to-violet-600",  light: "bg-indigo-50",  border: "border-indigo-100",  dot: "bg-indigo-500",  text: "text-indigo-600",  badge: "bg-indigo-100 text-indigo-700" },
  { gradient: "from-rose-500 to-pink-600",       light: "bg-rose-50",    border: "border-rose-100",    dot: "bg-rose-500",    text: "text-rose-600",    badge: "bg-rose-100 text-rose-700"    },
  { gradient: "from-amber-500 to-orange-600",    light: "bg-amber-50",   border: "border-amber-100",   dot: "bg-amber-500",   text: "text-amber-600",   badge: "bg-amber-100 text-amber-700"  },
  { gradient: "from-emerald-500 to-teal-600",    light: "bg-emerald-50", border: "border-emerald-100", dot: "bg-emerald-500", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700"},
  { gradient: "from-sky-500 to-cyan-600",        light: "bg-sky-50",     border: "border-sky-100",     dot: "bg-sky-500",     text: "text-sky-600",     badge: "bg-sky-100 text-sky-700"      },
];

export default async function SharedTripPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const trip = await prisma.trip.findFirst({
    where: { shareToken: token, isPublic: true },
    include: {
      user: { select: { name: true, image: true } },
      stops: {
        orderBy: { orderIndex: "asc" },
        include: { activities: true }
      }
    }
  });

  if (!trip) notFound();

  const startDate = new Date(trip.startDate);
  const endDate   = new Date(trip.endDate);
  const durationDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalActivities = trip.stops.reduce((sum, s) => sum + s.activities.length, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[50] bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tighter text-indigo-600 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Navigation className="text-white fill-current" size={18} />
            </div>
            traveloop
          </Link>
          <Link href="/register" className="px-5 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
            Plan your own trip
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative bg-slate-900 text-white pt-32 pb-48 overflow-hidden">
        {trip.coverImage && (
          <div className="absolute inset-0 z-0">
            <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-slate-900" />
          </div>
        )}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/20 mb-6">
            <Globe size={14} className="text-indigo-400" /> Shared Itinerary
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">{trip.name}</h1>
          <div className="flex items-center justify-center gap-6 text-slate-300 font-medium">
            <div className="flex items-center gap-2"><Calendar size={18} /> {startDate.toLocaleDateString("en-IN", { day: "numeric", month: "long" })} - {endDate.toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</div>
            <div className="flex items-center gap-2"><MapPin size={18} /> {trip.stops.length} Stops</div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Planned by</div>
             <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold">
                  {trip.user.name?.[0] || "U"}
                </div>
                <span className="text-sm font-bold">{trip.user.name || "A Travelooper"}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-20 pb-24 w-full">
         <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-indigo-100/50 border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-900">The Journey</h2>
                <p className="text-slate-500 font-medium">Follow along the planned stops and activities</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 text-center">
                  <div className="text-2xl font-black text-slate-900">{durationDays}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Days</div>
                </div>
                <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 text-center">
                  <div className="text-2xl font-black text-slate-900">{totalActivities}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activities</div>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              {trip.stops.map((stop, idx) => {
                const theme = stopGradients[idx % stopGradients.length];
                return (
                  <div key={stop.id} className="relative">
                    <div className="flex flex-col md:flex-row gap-8">
                       <div className="md:w-1/3">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.badge} text-[10px] font-black uppercase tracking-widest mb-3`}>
                            Stop {idx + 1}
                          </div>
                          <h3 className="text-3xl font-black text-slate-900 mb-2">{stop.cityName}</h3>
                          <p className="text-slate-500 font-bold mb-4">{stop.country}</p>
                          
                          <div className={`p-4 ${theme.light} rounded-2xl border ${theme.border} space-y-3`}>
                             <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <Calendar size={16} className={theme.text} />
                                {new Date(stop.arrivalDate!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - {new Date(stop.departureDate!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                             </div>
                          </div>
                       </div>
                       
                       <div className="md:w-2/3">
                          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                             <Star size={14} className="text-amber-500" /> Planned Activities
                          </h4>
                          
                          {stop.activities.length === 0 ? (
                            <div className="bg-slate-50 rounded-3xl p-8 text-center border border-dashed border-slate-200">
                               <Camera className="mx-auto text-slate-300 mb-2" size={32} />
                               <p className="text-sm text-slate-400 font-bold">No specific activities logged for this stop.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               {stop.activities.map((act) => (
                                 <div key={act.id} className="bg-slate-50 hover:bg-slate-100 p-5 rounded-3xl border border-slate-100 transition-colors">
                                    <div className="font-bold text-slate-900 mb-1">{act.name}</div>
                                    <div className="text-xs font-bold text-indigo-500 bg-white inline-block px-2 py-0.5 rounded-lg shadow-sm">
                                       ₹{Number(act.cost).toLocaleString()}
                                    </div>
                                 </div>
                               ))}
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
         </div>

         {trip.description && (
           <div className="mt-8 bg-slate-900 text-white rounded-[40px] p-12 shadow-xl">
              <h3 className="text-xl font-black mb-4">Trip Notes</h3>
              <p className="text-slate-400 leading-relaxed whitespace-pre-line">{trip.description}</p>
           </div>
         )}

         <div className="mt-16 text-center">
            <p className="text-slate-500 font-bold mb-6">Want to create your own travel itinerary like this?</p>
            <Link href="/" className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-full font-black shadow-xl shadow-indigo-200 hover:scale-105 transition-transform">
               Get Started with traveloop <Navigation size={20} className="fill-current" />
            </Link>
         </div>
      </div>
    </div>
  );
}
