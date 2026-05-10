import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Box, Plus, CheckCircle2, Circle, Shirt, Cpu, Shield, Pill, Camera, Coffee } from "lucide-react";

const mockCategories = [
  {
    name: "Essentials",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    icon: Shield,
    dot: "bg-indigo-500",
    items: [
      { name: "Passport & Visas", isPacked: true },
      { name: "Travel Insurance Documents", isPacked: true },
      { name: "Emergency Contact Cards", isPacked: false },
      { name: "Hotel & Flight Confirmations", isPacked: false },
    ],
  },
  {
    name: "Electronics",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    icon: Cpu,
    dot: "bg-cyan-500",
    items: [
      { name: "Universal Power Adapter", isPacked: true },
      { name: "Phone Charger & Power Bank", isPacked: true },
      { name: "Camera + Memory Cards", isPacked: false },
      { name: "Earphones / Headphones", isPacked: false },
    ],
  },
  {
    name: "Clothing",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    icon: Shirt,
    dot: "bg-violet-500",
    items: [
      { name: "Comfortable Walking Shoes", isPacked: false },
      { name: "Light Jackets (2x)", isPacked: false },
      { name: "T-Shirts (5x)", isPacked: true },
      { name: "Formal Outfit (1 set)", isPacked: false },
    ],
  },
  {
    name: "Health & Wellness",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    icon: Pill,
    dot: "bg-rose-500",
    items: [
      { name: "Prescription Medications", isPacked: false },
      { name: "Basic First Aid Kit", isPacked: false },
      { name: "Hand Sanitizer + Masks", isPacked: true },
      { name: "Sunscreen SPF 50+", isPacked: false },
    ],
  },
  {
    name: "Entertainment",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: Camera,
    dot: "bg-amber-500",
    items: [
      { name: "Travel Journal + Pen", isPacked: false },
      { name: "Kindle / Book", isPacked: false },
      { name: "Card Games", isPacked: false },
    ],
  },
  {
    name: "Snacks & Food",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    icon: Coffee,
    dot: "bg-emerald-500",
    items: [
      { name: "Reusable Water Bottle", isPacked: true },
      { name: "Energy Bars / Snacks", isPacked: false },
    ],
  },
];

export default async function PackingListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const trip = await prisma.trip.findUnique({
    where: { id, userId: user.id }
  });
  if (!trip) redirect("/dashboard");

  const allItems = mockCategories.flatMap(c => c.items);
  const totalItems = allItems.length;
  const packedItems = allItems.filter(i => i.isPacked).length;
  const progress = Math.round((packedItems / totalItems) * 100);
  const remaining = totalItems - packedItems;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 text-white pt-12 pb-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a855f7 0%, transparent 40%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href={`/trips/${trip.id}`} className="inline-flex items-center text-sm font-medium text-slate-300 hover:text-white mb-8 transition-colors gap-1">
            <ArrowLeft size={15} /> Back to Itinerary
          </Link>
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-orange-500/20 backdrop-blur-sm rounded-2xl border border-orange-500/30">
                <Box className="text-orange-400" size={36} />
              </div>
              <div>
                <p className="text-orange-400 font-semibold text-sm uppercase tracking-widest mb-1">Packing List</p>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{trip.name}</h1>
              </div>
            </div>
            <button className="self-start md:self-center flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-2xl transition-all shadow-lg">
              <Plus size={18} /> Add Item
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-16 relative z-10 pb-24">

        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Circular Progress */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke="#f97316"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(progress / 100) * 263.9} 263.9`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900">{progress}%</span>
              </div>
            </div>
            <div className="text-sm font-bold text-slate-700">Packed</div>
          </div>

          {/* Packed Count */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200 flex flex-col justify-center">
            <CheckCircle2 className="text-emerald-500 mb-3" size={28} />
            <div className="text-4xl font-black text-emerald-600">{packedItems}</div>
            <div className="text-slate-500 font-semibold mt-1">Items Packed</div>
          </div>

          {/* Still Need */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200 flex flex-col justify-center">
            <Circle className="text-rose-400 mb-3" size={28} />
            <div className="text-4xl font-black text-rose-500">{remaining}</div>
            <div className="text-slate-500 font-semibold mt-1">Still Needed</div>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockCategories.map((cat) => {
            const Icon = cat.icon;
            const catPacked = cat.items.filter(i => i.isPacked).length;
            const catPct = Math.round((catPacked / cat.items.length) * 100);
            return (
              <div key={cat.name} className={`bg-white rounded-3xl shadow-sm border ${cat.border} overflow-hidden`}>
                {/* Category Header */}
                <div className={`px-5 py-4 ${cat.bg} border-b ${cat.border} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={cat.color} />
                    <h3 className={`font-bold text-base ${cat.color}`}>{cat.name}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{catPacked}/{cat.items.length}</span>
                </div>

                {/* Mini progress */}
                <div className="w-full bg-slate-100 h-1">
                  <div className={`h-1 ${cat.dot} transition-all`} style={{ width: `${catPct}%` }} />
                </div>

                {/* Items */}
                <div className="divide-y divide-slate-50">
                  {cat.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className={`shrink-0 ${item.isPacked ? cat.color : 'text-slate-300'} group-hover:scale-110 transition-transform`}>
                        {item.isPacked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </div>
                      <span className={`text-sm font-medium ${item.isPacked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
