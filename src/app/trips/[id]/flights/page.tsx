import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Plane, Plus, Clock, MapPin, ArrowRight, Calendar, Tag, Train, Bus } from "lucide-react";

const mockFlights = [
  {
    type: "Flight",
    icon: Plane,
    from: { city: "Mumbai", code: "BOM", time: "23:45", date: "Aug 1" },
    to:   { city: "Paris",  code: "CDG", time: "07:30", date: "Aug 2" },
    airline: "Air India",
    flightNo: "AI 131",
    duration: "9h 45m",
    status: "Confirmed",
    pnr: "ABC123",
    class: "Economy",
    color: "indigo",
  },
  {
    type: "Train",
    icon: Train,
    from: { city: "Paris",  code: "CDG", time: "10:00", date: "Aug 6" },
    to:   { city: "London", code: "LON", time: "12:15", date: "Aug 6" },
    airline: "Eurostar",
    flightNo: "ES 9053",
    duration: "2h 15m",
    status: "Confirmed",
    pnr: "XYZ789",
    class: "Standard",
    color: "violet",
  },
  {
    type: "Flight",
    icon: Plane,
    from: { city: "London", code: "LHR", time: "16:20", date: "Aug 9" },
    to:   { city: "Mumbai", code: "BOM", time: "06:40", date: "Aug 10" },
    airline: "British Airways",
    flightNo: "BA 138",
    duration: "9h 20m",
    status: "Pending",
    pnr: "PQR456",
    class: "Economy",
    color: "sky",
  },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  "Confirmed": { label: "Confirmed", color: "text-emerald-700", bg: "bg-emerald-100" },
  "Pending":   { label: "Pending",   color: "text-amber-700",  bg: "bg-amber-100"  },
  "Cancelled": { label: "Cancelled", color: "text-rose-700",   bg: "bg-rose-100"   },
};

export default async function FlightsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const trip = await prisma.trip.findUnique({
    where: { id, userId: user.id }
  });
  if (!trip) redirect("/dashboard");

  const confirmed = mockFlights.filter(f => f.status === "Confirmed").length;
  const pending   = mockFlights.filter(f => f.status === "Pending").length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white pt-12 pb-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 25% 60%, #0ea5e9 0%, transparent 50%), radial-gradient(circle at 75% 20%, #8b5cf6 0%, transparent 40%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href={`/trips/${trip.id}`} className="inline-flex items-center text-sm font-medium text-slate-300 hover:text-white mb-8 transition-colors gap-1">
            <ArrowLeft size={15} /> Back to Itinerary
          </Link>
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-sky-500/20 backdrop-blur-sm rounded-2xl border border-sky-500/30">
                <Plane className="text-sky-400" size={36} />
              </div>
              <div>
                <p className="text-sky-400 font-semibold text-sm uppercase tracking-widest mb-1">Flights & Travel</p>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{trip.name}</h1>
              </div>
            </div>
            <button className="self-start md:self-center flex items-center gap-2 px-5 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-2xl transition-all shadow-lg">
              <Plus size={18} /> Add Journey
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-16 relative z-10 pb-24">

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { label: "Total Legs",  value: mockFlights.length, icon: Plane,    color: "text-sky-600",     bg: "bg-sky-50" },
            { label: "Confirmed",   value: confirmed,          icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Pending",     value: pending,            icon: Clock,    color: "text-amber-600",   bg: "bg-amber-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className={`inline-flex p-3 rounded-2xl mb-4 ${bg}`}>
                <Icon className={color} size={22} />
              </div>
              <div className={`text-4xl font-black ${color}`}>{value}</div>
              <div className="text-sm text-slate-500 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Journey Cards */}
        <div className="space-y-6">
          {mockFlights.map((flight, i) => {
            const Icon = flight.icon;
            const st = statusConfig[flight.status];
            return (
              <div key={i} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Card Top Bar */}
                <div className={`h-1.5 w-full bg-${flight.color}-500`} />

                <div className="p-6">
                  {/* Airline + Status Row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-${flight.color}-50 rounded-xl`}>
                        <Icon size={20} className={`text-${flight.color}-500`} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{flight.airline}</div>
                        <div className="text-xs text-slate-400 font-medium">{flight.flightNo} · {flight.class}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.color} ${st.bg}`}>{st.label}</span>
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{flight.pnr}</span>
                    </div>
                  </div>

                  {/* Route Visualization */}
                  <div className="flex items-center gap-4">
                    {/* Departure */}
                    <div className="text-center min-w-[90px]">
                      <div className="text-3xl font-black text-slate-900">{flight.from.time}</div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">{flight.from.date}</div>
                      <div className="font-bold text-slate-700 mt-2">{flight.from.city}</div>
                      <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">{flight.from.code}</div>
                    </div>

                    {/* Duration line */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <Clock size={12} /> {flight.duration}
                      </div>
                      <div className="relative w-full flex items-center">
                        <div className="flex-1 h-px bg-slate-200" />
                        <div className={`w-8 h-8 rounded-full bg-${flight.color}-50 border-2 border-${flight.color}-200 flex items-center justify-center mx-2`}>
                          <Icon size={14} className={`text-${flight.color}-500`} />
                        </div>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                        <MapPin size={10} className="text-slate-300" /> {flight.type} route
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="text-center min-w-[90px]">
                      <div className="text-3xl font-black text-slate-900">{flight.to.time}</div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">{flight.to.date}</div>
                      <div className="font-bold text-slate-700 mt-2">{flight.to.city}</div>
                      <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">{flight.to.code}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
