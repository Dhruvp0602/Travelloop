import Link from "next/link";
import { ArrowRight, Globe, Map, CreditCard, Sparkles, Navigation, Heart, Camera } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-40 pb-32">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/50 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/50 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-100/40 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-slate-200 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">The GenZ Travel Standard</span>
          </div>
          
          <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter mb-8 leading-[0.9] text-slate-900 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            TRAVEL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 italic pr-4">
              DIFFERENT.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-700 max-w-xl mb-12 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            The ultimate platform for modern explorers. Multi-city planning, AI suggestions, and budget tracking — all in one sleek interface.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <Link href="/register" className="group relative inline-flex items-center justify-center px-10 py-5 font-black text-white bg-slate-900 rounded-3xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-200">
              <span className="relative z-10">GET STARTED</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <ArrowRight className="relative z-10 ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link href="/explore" className="inline-flex items-center justify-center px-10 py-5 font-black text-slate-700 glass rounded-3xl border border-slate-200 hover:bg-white transition-all hover:scale-105 active:scale-95">
              EXPLORE
            </Link>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="hidden lg:block absolute top-[20%] left-[10%] animate-float pointer-events-none">
          <div className="glass p-4 rounded-3xl border border-white shadow-xl rotate-[-12deg]">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                   <Navigation className="text-indigo-600" size={20} />
                </div>
                <div>
                   <div className="text-[10px] font-bold text-slate-600 uppercase">Current Leg</div>
                   <div className="text-xs font-black text-slate-900">Mumbai → Paris</div>
                </div>
             </div>
          </div>
        </div>

        <div className="hidden lg:block absolute bottom-[25%] right-[12%] animate-float pointer-events-none" style={{ animationDelay: '1s' }}>
          <div className="glass p-4 rounded-3xl border border-white shadow-xl rotate-[8deg]">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                   <Heart className="text-pink-600 fill-pink-600" size={20} />
                </div>
                <div>
                   <div className="text-[10px] font-bold text-slate-600 uppercase">Saved</div>
                   <div className="text-xs font-black text-slate-900">Bali Dream Itinerary</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Big Item */}
          <div className="md:col-span-2 p-10 rounded-[3rem] bg-slate-900 text-white overflow-hidden relative group bento-item">
            <div className="relative z-10 h-full flex flex-col">
               <Sparkles className="text-indigo-400 mb-6" size={40} />
               <h3 className="text-4xl font-black mb-4 leading-tight">AI-Powered <br /> Trip Logic.</h3>
               <p className="text-slate-600 max-w-sm mb-8">Get smart suggestions for flights, hotels, and activities based on your vibe.</p>
               <div className="mt-auto flex gap-4">
                  <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold">Smart Budgeting</div>
                  <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold">Auto-Reorder</div>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/20 to-transparent group-hover:from-indigo-600/30 transition-all" />
          </div>

          {/* Small Item 1 */}
          <div className="p-10 rounded-[3rem] bg-indigo-50 border border-indigo-100 bento-item">
             <Map className="text-indigo-600 mb-6" size={40} />
             <h3 className="text-2xl font-black mb-4 text-slate-900">Multi-City Mapping.</h3>
             <p className="text-slate-700 text-sm">Visual routing for your complex world tours.</p>
          </div>

          {/* Small Item 2 */}
          <div className="p-10 rounded-[3rem] bg-emerald-50 border border-emerald-100 bento-item">
             <CreditCard className="text-emerald-600 mb-6" size={40} />
             <h3 className="text-2xl font-black mb-4 text-slate-900">Pro Budgeting.</h3>
             <p className="text-slate-700 text-sm">Track every Rupee with ease and precision.</p>
          </div>

          {/* Big Item 2 */}
          <div className="md:col-span-2 p-10 rounded-[3rem] bg-white border border-slate-200 overflow-hidden relative group bento-item">
            <div className="relative z-10">
               <Globe className="text-blue-600 mb-6" size={40} />
               <h3 className="text-4xl font-black mb-4 text-slate-900 leading-tight">Share Your Vibe.</h3>
               <p className="text-slate-700 max-w-sm mb-8">Public share links that look premium on any device. Family and friends will be jealous.</p>
               <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black">PREVIEW SHARE PAGE</button>
            </div>
            <Camera className="absolute bottom-[-20px] right-[-20px] text-slate-50 size-64 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* Social Proof / Call to Action */}
      <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20" />
         <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter">STOP DREAMING. <br /> START PLANNING.</h2>
            <Link href="/register" className="inline-flex items-center justify-center px-12 py-6 bg-white text-slate-900 rounded-[2rem] font-black text-xl hover:scale-110 active:scale-95 transition-all">
               CREATE TRIP NOW
            </Link>
         </div>
      </section>
    </div>
  );
}
