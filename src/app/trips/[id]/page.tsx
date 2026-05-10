import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/backend/lib/prisma";
import Link from "next/link";
import {
  ArrowLeft, Calendar, MapPin, Plus, Share2, Settings,
  Plane, CreditCard, Box, Clock, Star, Ticket, Camera,
  ChevronRight, Zap, Navigation, Globe, Trash2, Sparkles
} from "lucide-react";
import AITripSuggestions from "@/frontend/components/AITripSuggestions";
import AddStopForm from "@/frontend/components/AddStopForm";
import DeleteTripButton from "@/frontend/components/DeleteTripButton";
import MapView from "@/frontend/components/MapView";
import ShareTripButton from "@/frontend/components/ShareTripButton";
import AddActivityButton from "@/frontend/components/AddActivityButton";

// Assign a gradient per stop index for variety
const stopGradients = [
  { gradient: "from-indigo-500 to-violet-600",  light: "bg-indigo-50",  border: "border-indigo-100",  dot: "bg-indigo-500",  text: "text-indigo-600",  badge: "bg-indigo-100 text-indigo-700" },
  { gradient: "from-rose-500 to-pink-600",       light: "bg-rose-50",    border: "border-rose-100",    dot: "bg-rose-500",    text: "text-rose-600",    badge: "bg-rose-100 text-rose-700"    },
  { gradient: "from-amber-500 to-orange-600",    light: "bg-amber-50",   border: "border-amber-100",   dot: "bg-amber-500",   text: "text-amber-600",   badge: "bg-amber-100 text-amber-700"  },
  { gradient: "from-emerald-500 to-teal-600",    light: "bg-emerald-50", border: "border-emerald-100", dot: "bg-emerald-500", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700"},
  { gradient: "from-sky-500 to-cyan-600",        light: "bg-sky-50",     border: "border-sky-100",     dot: "bg-sky-500",     text: "text-sky-600",     badge: "bg-sky-100 text-sky-700"      },
];

function getStopDuration(arrivalDate: Date | null, departureDate: Date | null): string | null {
  if (!arrivalDate || !departureDate) return null;
  const days = Math.round((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
  return days === 1 ? "1 night" : `${days} nights`;
}

export default async function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const trip = await prisma.trip.findUnique({
    where: { id, userId: user.id },
    include: {
      stops: {
        orderBy: { orderIndex: "asc" },
        include: { activities: true }
      }
    }
  });

  if (!trip) redirect("/dashboard");

  const startDate = new Date(trip.startDate);
  const endDate   = new Date(trip.endDate);
  const durationDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalActivities = trip.stops.reduce((sum, s) => sum + s.activities.length, 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* ── Dynamic Header ────────────────────────────────── */}
      <div className="relative min-h-[50vh] flex flex-col justify-end pb-24 overflow-hidden pt-44">
         {/* Animated Background */}
         <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-slate-950/80 z-10" />
           <img 
              src={trip.coverImage || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop"} 
              alt={trip.name} 
              className="w-full h-full object-cover animate-in fade-in zoom-in-110 duration-1000"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-transparent to-transparent z-20" />
         </div>

         <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl glass text-white text-xs font-black uppercase tracking-widest mb-8 hover:scale-105 transition-all">
               <ArrowLeft size={16} /> Dashboard
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
               <div className="max-w-3xl">
                  <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none mb-4 drop-shadow-2xl">
                     {trip.name.toUpperCase()}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-white">
                     <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-xl text-xs font-bold border-white/10">
                        <Calendar size={14} className="text-indigo-400" />
                        {startDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} — {endDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                     </div>
                     <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-xl text-xs font-bold border-white/10">
                        <Clock size={14} className="text-emerald-400" />
                        {durationDays} Days Adventure
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <ShareTripButton 
                    tripId={trip.id} 
                    initialShareToken={trip.shareToken} 
                    initialIsPublic={trip.isPublic} 
                  />
                  <button className="w-11 h-11 glass rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-all border-white/10">
                     <Settings size={20} />
                  </button>
                  <DeleteTripButton tripId={trip.id} tripName={trip.name} />
               </div>
            </div>
         </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-8 relative z-40 pb-32">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── Itinerary Column ─────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-8">
            
            {/* Bento Itinerary Header */}
            <div className="p-8 rounded-[3rem] bg-white border border-slate-200 shadow-xl shadow-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white rotate-[-8deg] group-hover:rotate-0 transition-transform duration-500">
                  <Navigation size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">THE ROADMAP.</h2>
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">{trip.stops.length} DESTINATIONS LOCKED IN</p>
                </div>
              </div>
              <AddStopForm
                tripId={trip.id}
                existingStops={trip.stops.map(s => ({ id: s.id, cityName: s.cityName, arrivalDate: s.arrivalDate?.toISOString() ?? null, departureDate: s.departureDate?.toISOString() ?? null }))}
                tripStartDate={trip.startDate.toISOString()}
                tripEndDate={trip.endDate.toISOString()}
              />
            </div>

            {/* ── Empty State ───────────────────────────── */}
            {trip.stops.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200 shadow-sm animate-pulse">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 rotate-12">
                  <MapPin size={40} className="text-indigo-500" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">WHERE TO FIRST?</h3>
                <p className="text-slate-700 mb-10 max-w-sm mx-auto text-lg font-medium leading-relaxed">
                  Start your journey by adding a city. Our AI will handle the rest of the vibe check.
                </p>
                <AddStopForm
                  tripId={trip.id}
                  existingStops={trip.stops.map(s => ({ id: s.id, cityName: s.cityName, arrivalDate: s.arrivalDate?.toISOString() ?? null, departureDate: s.departureDate?.toISOString() ?? null }))}
                  tripStartDate={trip.startDate.toISOString()}
                  tripEndDate={trip.endDate.toISOString()}
                />
              </div>
            ) : (
              /* ── Stops Timeline ────────────────────────── */
              <div className="space-y-12 relative">
                {/* Visual Timeline Path */}
                <div className="absolute left-8 top-12 bottom-12 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 opacity-10 hidden md:block" />

                {trip.stops.map((stop, index) => {
                  const theme = stopGradients[index % stopGradients.length];
                  const arrival   = stop.arrivalDate   ? new Date(stop.arrivalDate)   : null;
                  const departure = stop.departureDate ? new Date(stop.departureDate) : null;
                  const duration  = getStopDuration(arrival, departure);

                  return (
                    <div key={stop.id} className="relative flex flex-col md:flex-row gap-8 group/stop">
                      {/* Timeline Dot */}
                      <div className="hidden md:flex flex-col items-center shrink-0 z-10 pt-8">
                         <div className={`w-16 h-16 rounded-[2rem] bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-2xl text-white font-black text-xl rotate-[-10deg] group-hover/stop:rotate-0 transition-transform duration-500`}>
                            {index + 1}
                         </div>
                      </div>

                      {/* Stop Card */}
                      <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden hover:scale-[1.01] transition-transform duration-500">
                         {/* Card Header Section */}
                         <div className="p-10">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                               <div className="flex items-start gap-6">
                                  <div className={`w-16 h-16 ${theme.light} rounded-3xl flex items-center justify-center shrink-0`}>
                                     <MapPin size={32} className={theme.text} />
                                  </div>
                                  <div>
                                     <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stop.cityName.toUpperCase()}</h3>
                                        {duration && (
                                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${theme.badge}`}>
                                             {duration}
                                          </span>
                                        )}
                                     </div>
                                     <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">{stop.country}</p>
                                  </div>
                               </div>

                               {(arrival || departure) && (
                                 <div className="px-6 py-4 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-3">
                                    <Calendar size={18} className="text-slate-600" />
                                    <div className="text-sm font-black text-slate-700">
                                       {arrival?.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — {departure?.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                    </div>
                                 </div>
                               )}
                            </div>

                            {/* Map View Integration */}
                            <div className="mb-10 rounded-[2rem] overflow-hidden border border-slate-100">
                               <MapView cityName={stop.cityName} country={stop.country} />
                            </div>

                            {/* Activities Bento */}
                            <div className="space-y-6">
                               <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                     <Sparkles size={14} className="text-amber-500" /> Top Vibes
                                  </h4>
                               </div>

                               {stop.activities.length === 0 ? (
                                 <div className="bg-slate-50/50 rounded-[2rem] p-10 text-center border border-dashed border-slate-200">
                                    <Camera size={24} className="text-slate-300 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-slate-600">NO PLANS YET. ADD SOME MAGIC.</p>
                                 </div>
                               ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {stop.activities.map((activity, ai) => (
                                      <div key={activity.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between group/act hover:bg-white hover:shadow-lg transition-all">
                                         <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white text-[10px] font-black`}>
                                               {ai + 1}
                                            </div>
                                            <span className="font-black text-sm text-slate-700 uppercase tracking-tight">{activity.name}</span>
                                         </div>
                                         <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                                            ₹{Number(activity.cost).toLocaleString()}
                                         </div>
                                      </div>
                                    ))}
                                 </div>
                               )}

                               <AddActivityButton 
                                 tripId={trip.id} 
                                 stopId={stop.id} 
                                 cityName={stop.cityName}
                                 theme={theme}
                               />
                            </div>
                         </div>
                      </div>
                    </div>
                  );
                })}

                {/* Final Add Stop Marker */}
                <div className="flex justify-center md:justify-start md:pl-28 pt-8">
                   <AddStopForm
                      tripId={trip.id}
                      existingStops={trip.stops.map(s => ({ id: s.id, cityName: s.cityName, arrivalDate: s.arrivalDate?.toISOString() ?? null, departureDate: s.departureDate?.toISOString() ?? null }))}
                      tripStartDate={trip.startDate.toISOString()}
                      tripEndDate={trip.endDate.toISOString()}
                   />
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────── */}
          <div className="w-full lg:w-[350px] space-y-8">
            
            {/* Bento Stats Card */}
            <div className="p-8 rounded-[3rem] bg-slate-900 text-white shadow-2xl shadow-indigo-100 overflow-hidden relative group">
               <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-indigo-600/30 rounded-full blur-[60px]" />
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-8">TRIP ANALYTICS</h3>
               
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "STAYS", value: `${durationDays}D`, icon: Clock, color: "text-indigo-400" },
                    { label: "STOPS", value: trip.stops.length, icon: MapPin, color: "text-pink-400" },
                    { label: "LOGS", value: totalActivities, icon: Ticket, color: "text-amber-400" },
                    { label: "TYPE", value: trip.isPublic ? "PUBLIC" : "PRIVATE", icon: Globe, color: "text-emerald-400" },
                  ].map((stat) => (
                     <div key={stat.label} className="bg-white/5 p-5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                        <stat.icon size={18} className={`${stat.color} mb-3`} />
                        <div className={`text-2xl font-black ${stat.color.replace('400', '100')}`}>{stat.value}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</div>
                     </div>
                  ))}
               </div>
            </div>

            {/* AI Suggestions Section */}
            <div className="animate-in slide-in-from-right duration-700">
               <AITripSuggestions
                   tripName={trip.name}
                   tripId={trip.id}
                   stops={trip.stops.map(s => ({ cityName: s.cityName, country: s.country }))}
                 />
            </div>

            {/* Pro Tools Section */}
            <div className="p-8 rounded-[3rem] bg-white border border-slate-200 shadow-xl shadow-slate-100">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 mb-6">PRO TOOLS</h3>
               <div className="space-y-4">
                  {[
                    { href: `/trips/${trip.id}/budget`,  icon: CreditCard, label: "BUDGET TRACKER", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { href: `/trips/${trip.id}/packing`, icon: Box,        label: "PACKING LIST",   color: "text-orange-600",  bg: "bg-orange-50"  },
                    { href: `/trips/${trip.id}/flights`, icon: Plane,      label: "TRANSPORT",      color: "text-sky-600",     bg: "bg-sky-50"     },
                  ].map((tool) => (
                    <Link key={tool.href} href={tool.href} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 hover:bg-slate-900 hover:text-white group transition-all duration-300">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 ${tool.bg} ${tool.color} rounded-2xl group-hover:bg-white/10 transition-colors`}>
                             <tool.icon size={20} />
                          </div>
                          <span className="text-xs font-black tracking-widest">{tool.label}</span>
                       </div>
                       <ChevronRight size={18} className="text-slate-300 group-hover:text-white transition-colors" />
                    </Link>
                  ))}
               </div>
            </div>

            {/* Description Card */}
            {trip.description && (
              <div className="p-8 rounded-[3rem] bg-indigo-50/50 border border-indigo-100">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-4">THE MISSION</h3>
                 <p className="text-sm font-bold text-slate-600 leading-relaxed italic">"{trip.description}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
