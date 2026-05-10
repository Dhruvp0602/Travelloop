import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar, Map, MapPin, Plus, Share2, Settings, Plane, CreditCard, Box } from "lucide-react";
import AITripSuggestions from "@/components/AITripSuggestions";
import AddStopForm from "@/components/AddStopForm";

export default async function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) redirect("/login");

  const trip = await prisma.trip.findUnique({
    where: { 
      id: id,
      userId: user.id // Ensure only the owner can view (for now, until sharing is implemented)
    },
    include: {
      stops: {
        orderBy: { orderIndex: 'asc' },
        include: {
          activities: true
        }
      }
    }
  });

  if (!trip) {
    redirect("/dashboard");
  }

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const durationDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Trip Header Banner */}
      <div className="relative bg-slate-900 text-white overflow-hidden pt-20 pb-24">
        {trip.coverImage && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply z-10"></div>
            <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover opacity-50" />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-white border border-white/20">
                  {durationDays} Days
                </span>
                {trip.isPublic && (
                  <span className="px-3 py-1 bg-indigo-500/20 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                    Public Itinerary
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{trip.name}</h1>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar size={18} />
                <span>{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-medium transition-all border border-white/20">
                <Share2 size={18} />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all shadow-lg">
                <Settings size={18} />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-10 relative z-20 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Timeline / Itinerary */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Map size={24} className="text-indigo-500" />
                Itinerary Builder
              </h2>
              <AddStopForm tripId={trip.id} />
            </div>

            {trip.stops.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm border-dashed">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
                  <MapPin size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Your itinerary is empty</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Start building your trip by adding cities or stops. You can then add activities and expenses to each stop.
                </p>
                <AddStopForm tripId={trip.id} />
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {trip.stops.map((stop, index) => (
                  <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-slate-50 bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <MapPin size={24} />
                    </div>
                    <div className="w-[calc(100%-5rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-slate-900">{stop.cityName}, {stop.country}</h3>
                      </div>
                      <p className="text-sm text-slate-500 mb-4">
                        {stop.arrivalDate ? new Date(stop.arrivalDate).toLocaleDateString() : 'Date TBD'} 
                        {stop.departureDate ? ` - ${new Date(stop.departureDate).toLocaleDateString()}` : ''}
                      </p>
                      
                      <div className="space-y-3">
                        {stop.activities.length === 0 ? (
                          <p className="text-sm text-slate-400 italic">No activities planned yet.</p>
                        ) : (
                          stop.activities.map(activity => (
                            <div key={activity.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="font-medium text-sm text-slate-700">{activity.name}</span>
                              <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">₹{activity.cost}</span>
                            </div>
                          ))
                        )}
                        <button className="w-full py-2 border-2 border-dashed border-slate-200 text-slate-500 text-sm font-medium rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1">
                          <Plus size={16} /> Add Activity
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar / Quick Actions */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            <AITripSuggestions tripName={trip.name} tripId={trip.id} />
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Trip Tools</h3>
              <div className="space-y-3">
                <Link href={`/trips/${trip.id}/budget`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Budget Tracker</div>
                    <div className="text-xs text-slate-500">Manage expenses</div>
                  </div>
                </Link>
                <Link href={`/trips/${trip.id}/packing`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <Box size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Packing List</div>
                    <div className="text-xs text-slate-500">Don't forget anything</div>
                  </div>
                </Link>
                <Link href={`/trips/${trip.id}/flights`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
                    <Plane size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Flights & Travel</div>
                    <div className="text-xs text-slate-500">Manage transport</div>
                  </div>
                </Link>
              </div>
            </div>

            {trip.description && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-3">About this trip</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {trip.description}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
