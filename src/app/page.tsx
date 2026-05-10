import Link from "next/link";
import { ArrowRight, Globe, Map, CreditCard, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex-grow flex items-center justify-center overflow-hidden bg-slate-900 text-white pt-24 pb-32">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900/90 to-slate-900/95 z-10"></div>
          {/* We would use a real image here normally, but CSS gradients give a premium feel too */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in-up">
            <Sparkles size={16} className="text-indigo-300" />
            <span className="text-sm font-medium text-indigo-100">The smarter way to travel</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Plan your next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              dream adventure
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-12 font-medium">
            Traveloop helps you build multi-city itineraries, manage travel budgets, and share your journey with friends all in one beautiful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href="/register" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-indigo-600 rounded-full overflow-hidden transition-all hover:bg-indigo-700 hover:scale-105 shadow-[0_0_40px_-10px_rgba(79,70,229,0.7)]">
              <span>Start Planning Free</span>
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link href="/explore" className="inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all">
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative -mt-10 rounded-t-[3rem] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need for the perfect trip</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">From budgeting to packing lists, Traveloop handles the logistics so you can focus on making memories.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Map size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-City Itineraries</h3>
              <p className="text-slate-600 leading-relaxed">
                Easily plan complex trips with multiple stops. Reorder cities and manage dates with our intuitive drag-and-drop builder.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Budgeting</h3>
              <p className="text-slate-600 leading-relaxed">
                Track expenses across categories like transport, hotels, and meals. Get over-budget alerts and visualize costs with beautiful charts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Collaborative Sharing</h3>
              <p className="text-slate-600 leading-relaxed">
                Generate a unique public link to share your read-only itinerary with friends and family, or invite them to collaborate in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
