import Link from "next/link";
import { ArrowLeft, MapPin, Star, Search } from "lucide-react";

const POPULAR_DESTINATIONS = [
  {
    id: "1",
    cityName: "Tokyo",
    country: "Japan",
    region: "Asia",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop",
    popularity: 98,
    tags: ["Culture", "Food", "Technology"]
  },
  {
    id: "2",
    cityName: "Paris",
    country: "France",
    region: "Europe",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop",
    popularity: 95,
    tags: ["Romance", "Art", "Architecture"]
  },
  {
    id: "3",
    cityName: "Bali",
    country: "Indonesia",
    region: "Asia",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop",
    popularity: 92,
    tags: ["Beaches", "Nature", "Relaxation"]
  },
  {
    id: "4",
    cityName: "New York",
    country: "USA",
    region: "North America",
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000&auto=format&fit=crop",
    popularity: 90,
    tags: ["City Life", "Entertainment", "Shopping"]
  },
  {
    id: "5",
    cityName: "Rome",
    country: "Italy",
    region: "Europe",
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000&auto=format&fit=crop",
    popularity: 89,
    tags: ["History", "Food", "Architecture"]
  },
  {
    id: "6",
    cityName: "Cape Town",
    country: "South Africa",
    region: "Africa",
    imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=1000&auto=format&fit=crop",
    popularity: 85,
    tags: ["Nature", "Adventure", "Beaches"]
  }
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Explore Destinations</h1>
            <p className="text-lg text-slate-500">Discover popular places to add to your next itinerary.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
              placeholder="Search cities, countries..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {POPULAR_DESTINATIONS.map((dest) => (
            <div key={dest.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="h-64 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img 
                  src={dest.imageUrl} 
                  alt={dest.cityName} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold text-slate-800">{dest.popularity}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-1.5 text-indigo-600 font-medium text-sm mb-2">
                  <MapPin size={16} />
                  <span>{dest.country}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {dest.cityName}
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {dest.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="w-full py-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold rounded-xl transition-colors border border-slate-200 hover:border-indigo-200 flex justify-center items-center gap-2">
                  <MapPin size={18} />
                  Add to Trip
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
