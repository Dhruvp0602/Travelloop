import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, MapPin, Calendar, Clock } from "lucide-react";
import { prisma } from "@/backend/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user trips
  // We need to type the session user to include ID, but for now we look up by email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: {
      trips: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  const trips = user?.trips || [];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Trips</h1>
            <p className="text-slate-500 mt-1">Manage your upcoming adventures and past memories.</p>
          </div>
          
          <Link 
            href="/trips/new" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Plan New Trip</span>
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6">
              <MapPin size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No trips yet</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              You haven't planned any trips yet. Start your first adventure by clicking the button below.
            </p>
            <Link 
              href="/trips/new" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all hover:scale-105 shadow-md"
            >
              <Plus size={20} />
              <span>Create Your First Trip</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link 
                href={`/trips/${trip.id}`} 
                key={trip.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  {trip.coverImage ? (
                    <img 
                      src={trip.coverImage} 
                      alt={trip.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <MapPin size={48} className="text-white opacity-50" />
                    </div>
                  )}
                  {trip.isPublic && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600">
                      Public
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {trip.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={16} className="text-slate-400" />
                      <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {trip.description && (
                    <p className="text-slate-600 text-sm line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
