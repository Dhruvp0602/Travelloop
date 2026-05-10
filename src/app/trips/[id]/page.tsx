import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowLeft, Calendar, MapPin, Plus, Share2, Settings,
  Plane, CreditCard, Box, Clock, Star, Ticket, Camera,
  ChevronRight, Zap, Navigation, Globe
} from "lucide-react";
import AITripSuggestions from "@/components/AITripSuggestions";
import AddStopForm from "@/components/AddStopForm";
import DeleteTripButton from "@/components/DeleteTripButton";
import MapView from "@/components/MapView";

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
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* ── Hero Header ────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden pt-16 pb-32">
        {/* animated orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
        </div>
        {trip.coverImage && (
          <div className="absolute inset-0 z-0">
            <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-slate-900" />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-300 hover:text-white mb-8 transition-colors gap-1.5">
            <ArrowLeft size={15} /> Back to Dashboard
          </Link>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { icon: Clock,    label: `${durationDays} Days` },
              { icon: MapPin,   label: `${trip.stops.length} Stops` },
              { icon: Ticket,   label: `${totalActivities} Activities` },
              ...(trip.isPublic ? [{ icon: Globe, label: "Public" }] : []),
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-white/20">
                <Icon size={12} /> {label}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {trip.name}
          </h1>
          <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
            <Calendar size={16} />
            {startDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            {" — "}
            {endDate.toLocaleDateString("en-IN",   { day: "numeric", month: "long", year: "numeric" })}
          </div>

          <div className="flex gap-3 mt-8">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-medium transition-all border border-white/20 text-sm">
              <Share2 size={16} /> Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all shadow-lg text-sm">
              <Settings size={16} /> Settings
            </button>
            <DeleteTripButton tripId={trip.id} tripName={trip.name} />
          </div>
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-16 relative z-20 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Itinerary Column ─────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Itinerary Header */}
            <div className="bg-white rounded-3xl px-6 py-4 shadow-sm border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <Navigation size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Itinerary Builder</h2>
                  <p className="text-xs text-slate-400">{trip.stops.length} destination{trip.stops.length !== 1 ? "s" : ""} planned</p>
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
              <div className="bg-white rounded-3xl p-14 text-center border-2 border-dashed border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                  <MapPin size={32} className="text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Your adventure starts here</h3>
                <p className="text-slate-500 mb-7 max-w-sm mx-auto text-sm leading-relaxed">
                  Add your first destination. You can plan activities, track spending, and get AI-powered suggestions for each stop.
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
              <div className="relative">

                {/* Connecting line */}
                <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-gradient-to-b from-indigo-200 via-violet-200 to-transparent hidden md:block" />

                <div className="space-y-5">
                  {trip.stops.map((stop, index) => {
                    const theme = stopGradients[index % stopGradients.length];
                    const arrival   = stop.arrivalDate   ? new Date(stop.arrivalDate)   : null;
                    const departure = stop.departureDate ? new Date(stop.departureDate) : null;
                    const duration  = getStopDuration(arrival, departure);

                    return (
                      <div key={stop.id} className="relative flex gap-5">

                        {/* ── Timeline Node ───── */}
                        <div className="hidden md:flex flex-col items-center shrink-0 z-10">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg text-white font-black text-sm shrink-0`}>
                            {index + 1}
                          </div>
                          {index < trip.stops.length - 1 && (
                            <div className="flex-1 w-0.5 mt-2 bg-slate-200 min-h-4" />
                          )}
                        </div>

                        {/* ── Stop Card ──────── */}
                        <div className={`flex-1 bg-white rounded-3xl shadow-sm border ${theme.border} overflow-hidden hover:shadow-md transition-shadow`}>
                          {/* Color accent strip */}
                          <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`} />

                          <div className="p-6">
                            {/* City header */}
                            <div className="flex items-start justify-between gap-4 mb-5">
                              <div className="flex items-center gap-3">
                                <div className={`p-2.5 ${theme.light} rounded-2xl`}>
                                  <MapPin size={20} className={theme.text} />
                                </div>
                                <div>
                                  <h3 className="font-black text-xl text-slate-900">{stop.cityName}</h3>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-sm text-slate-500 font-medium">{stop.country}</span>
                                    {duration && (
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${theme.badge}`}>
                                        {duration}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <span className={`hidden sm:inline text-xs font-bold ${theme.badge} px-2 py-1 rounded-xl`}>
                                Stop {index + 1}
                              </span>
                            </div>

                            {/* Date range bar */}
                            {(arrival || departure) && (
                              <div className={`flex items-center gap-2 ${theme.light} rounded-2xl px-4 py-3 mb-5 border ${theme.border}`}>
                                <Calendar size={15} className={theme.text} />
                                <span className="text-sm font-semibold text-slate-700">
                                  {arrival   ? arrival.toLocaleDateString("en-IN",   { day: "numeric", month: "short" }) : "TBD"}
                                  {" → "}
                                  {departure ? departure.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "TBD"}
                                </span>
                              </div>
                            )}

                            {/* Map View Toggle */}
                            <MapView cityName={stop.cityName} country={stop.country} />

                            {/* Activities */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                  <Star size={14} className="text-amber-500" />
                                  Activities
                                  {stop.activities.length > 0 && (
                                    <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">
                                      {stop.activities.length}
                                    </span>
                                  )}
                                </h4>
                              </div>

                              {stop.activities.length === 0 ? (
                                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-dashed border-slate-200">
                                  <Camera size={20} className="text-slate-300 mx-auto mb-1.5" />
                                  <p className="text-xs text-slate-400 font-medium">No activities yet — add something to do!</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {stop.activities.map((activity, ai) => (
                                    <div key={activity.id}
                                      className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 p-3.5 rounded-2xl border border-slate-100 transition-colors group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white text-xs font-black`}>
                                          {ai + 1}
                                        </div>
                                        <span className="font-semibold text-sm text-slate-800">{activity.name}</span>
                                      </div>
                                      <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-xl shadow-sm border border-slate-100">
                                        ₹{Number(activity.cost).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <button className={`w-full mt-3 py-2.5 border-2 border-dashed ${theme.border} ${theme.text} text-xs font-bold rounded-2xl hover:${theme.light} transition-colors flex items-center justify-center gap-1.5`}>
                                <Plus size={14} /> Add Activity
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* End of timeline marker */}
                  <div className="relative flex gap-5">
                    <div className="hidden md:flex flex-col items-center shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                        <Zap size={18} className="text-slate-400" />
                      </div>
                    </div>
                    <div className="flex-1 flex items-center">
                      <AddStopForm
                        tripId={trip.id}
                        existingStops={trip.stops.map(s => ({ id: s.id, cityName: s.cityName, arrivalDate: s.arrivalDate?.toISOString() ?? null, departureDate: s.departureDate?.toISOString() ?? null }))}
                        tripStartDate={trip.startDate.toISOString()}
                        tripEndDate={trip.endDate.toISOString()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────── */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">

            {/* Trip Stats Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-widest text-slate-400">Trip Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Duration",    value: `${durationDays}d`,          icon: Clock,   color: "text-indigo-500",  bg: "bg-indigo-50" },
                  { label: "Stops",       value: trip.stops.length,            icon: MapPin,  color: "text-rose-500",    bg: "bg-rose-50"   },
                  { label: "Activities",  value: totalActivities,              icon: Ticket,  color: "text-amber-500",   bg: "bg-amber-50"  },
                  { label: "Visibility",  value: trip.isPublic ? "Public" : "Private", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-50" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className={`${bg} rounded-2xl p-3 flex flex-col gap-1`}>
                    <Icon size={16} className={color} />
                    <div className="font-black text-xl text-slate-900">{value}</div>
                    <div className="text-xs text-slate-500 font-semibold">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            <AITripSuggestions
                tripName={trip.name}
                tripId={trip.id}
                stops={trip.stops.map(s => ({ cityName: s.cityName, country: s.country }))}
              />

            {/* Trip Tools */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Trip Tools</h3>
              <div className="space-y-2">
                {[
                  { href: `/trips/${trip.id}/budget`,  icon: CreditCard, label: "Budget Tracker",  sub: "Manage expenses",    color: "text-emerald-600", bg: "bg-emerald-100" },
                  { href: `/trips/${trip.id}/packing`, icon: Box,        label: "Packing List",    sub: "Don't forget anything", color: "text-orange-600",  bg: "bg-orange-100"  },
                  { href: `/trips/${trip.id}/flights`, icon: Plane,      label: "Flights & Travel", sub: "Manage transport",   color: "text-sky-600",     bg: "bg-sky-100"     },
                ].map(({ href, icon: Icon, label, sub, color, bg }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
                  >
                    <div className={`p-2 ${bg} ${color} rounded-xl`}><Icon size={18} /></div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-900">{label}</div>
                      <div className="text-xs text-slate-400">{sub}</div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Description */}
            {trip.description && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-3">About this trip</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{trip.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
