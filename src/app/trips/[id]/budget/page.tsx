import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, CreditCard, Receipt, Wallet, TrendingUp, ShoppingBag, Hotel, Car, Utensils, Ticket, Plus, PiggyBank } from "lucide-react";
import AddExpenseButton from "@/components/AddExpenseButton";

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string; bar: string }> = {
  "Flights":    { icon: CreditCard,  color: "text-sky-600",    bg: "bg-sky-100",    bar: "bg-sky-500"    },
  "Hotels":     { icon: Hotel,       color: "text-violet-600", bg: "bg-violet-100", bar: "bg-violet-500" },
  "Food":       { icon: Utensils,    color: "text-amber-600",  bg: "bg-amber-100",  bar: "bg-amber-500"  },
  "Transport":  { icon: Car,         color: "text-emerald-600",bg: "bg-emerald-100",bar: "bg-emerald-500" },
  "Activities": { icon: Ticket,      color: "text-rose-600",   bg: "bg-rose-100",   bar: "bg-rose-500"   },
  "Shopping":   { icon: ShoppingBag, color: "text-pink-600",   bg: "bg-pink-100",   bar: "bg-pink-500"   },
};

export default async function BudgetTrackerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const trip = await prisma.trip.findUnique({
    where: { id, userId: user.id },
    include: { expenses: true }
  });
  if (!trip) redirect("/dashboard");

  // Use REAL expense data only
  const expenses = trip.expenses;
  const hasExpenses = expenses.length > 0;

  const totalBudget = trip.budget || 0;
  const totalSpent  = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining   = totalBudget - totalSpent;
  const percentSpent = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  // Group real expenses by category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    const cat = e.category || "Other";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
  });
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxCategoryAmount = sortedCategories[0]?.[1] || 1;

  const gaugeColor = percentSpent > 90 ? "#f43f5e" : percentSpent > 70 ? "#f59e0b" : "#10b981";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white pt-12 pb-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 40%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href={`/trips/${trip.id}`} className="inline-flex items-center text-sm font-medium text-slate-300 hover:text-white mb-8 transition-colors gap-1">
            <ArrowLeft size={15} /> Back to Itinerary
          </Link>
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-500/20 backdrop-blur-sm rounded-2xl border border-emerald-500/30">
                <CreditCard className="text-emerald-400" size={36} />
              </div>
              <div>
                <p className="text-emerald-400 font-semibold text-sm uppercase tracking-widest mb-1">Budget Tracker</p>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{trip.name}</h1>
              </div>
            </div>
            <AddExpenseButton tripId={trip.id} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-16 relative z-10 pb-24">

        {/* KPI Cards — always shown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="inline-flex p-3 rounded-2xl mb-4 bg-indigo-50"><Wallet className="text-indigo-500" size={22} /></div>
            <div className="text-3xl font-black text-slate-900">{totalBudget > 0 ? `₹${totalBudget.toLocaleString()}` : "—"}</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">Total Budget</div>
            <div className="text-xs text-slate-400 mt-0.5">Trip allowance</div>
          </div>
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="inline-flex p-3 rounded-2xl mb-4 bg-rose-50"><Receipt className="text-rose-500" size={22} /></div>
            <div className="text-3xl font-black text-rose-600">₹{totalSpent.toLocaleString()}</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">Total Spent</div>
            <div className="text-xs text-slate-400 mt-0.5">{hasExpenses ? `${percentSpent}% of budget` : "No expenses yet"}</div>
          </div>
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="inline-flex p-3 rounded-2xl mb-4 bg-emerald-50"><TrendingUp className="text-emerald-500" size={22} /></div>
            <div className="text-3xl font-black text-emerald-600">{totalBudget > 0 ? `₹${remaining.toLocaleString()}` : "—"}</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">Remaining</div>
            <div className="text-xs text-slate-400 mt-0.5">{totalBudget > 0 ? (remaining >= 0 ? "Looking good!" : "Over budget!") : "Set a budget to track"}</div>
          </div>
        </div>

        {/* ── Empty State ── */}
        {!hasExpenses ? (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <PiggyBank size={36} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No expenses tracked yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm mb-7 leading-relaxed">
              Start logging your flight costs, hotel bills, food, and activities to see a full breakdown of your trip spending.
            </p>
            <AddExpenseButton tripId={trip.id} />
          </div>
        ) : (
          <>
            {/* Budget Gauge + Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
              {/* Gauge */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col justify-between">
                <h3 className="font-bold text-slate-900 text-lg mb-6">Budget Usage</h3>
                <div className="flex justify-center">
                  <div className="relative w-44 h-44">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                      <circle cx="50" cy="50" r="42" fill="none"
                        stroke={gaugeColor}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(percentSpent / 100) * 263.9} 263.9`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-900">{percentSpent}%</span>
                      <span className="text-xs text-slate-500 font-semibold">Spent</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between text-sm font-semibold text-slate-500">
                  <span>₹0</span><span>₹{totalBudget.toLocaleString()}</span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 text-lg mb-6">Spending by Category</h3>
                <div className="space-y-4">
                  {sortedCategories.map(([cat, amount]) => {
                    const cfg = categoryConfig[cat] || { icon: Receipt, color: "text-slate-600", bg: "bg-slate-100", bar: "bg-slate-400" };
                    const Icon = cfg.icon;
                    const pct  = Math.round((amount / totalSpent) * 100);
                    const barW = Math.round((amount / maxCategoryAmount) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${cfg.bg}`}><Icon size={14} className={cfg.color} /></div>
                            <span className="text-sm font-semibold text-slate-700">{cat}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-900">₹{amount.toLocaleString()}</span>
                            <span className="text-xs text-slate-400 ml-1">({pct}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${cfg.bar} transition-all duration-700`} style={{ width: `${barW}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
                <span className="text-sm text-slate-500 font-medium">{expenses.length} transaction{expenses.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {expenses.map((exp) => {
                  const cat = exp.category || "Other";
                  const cfg = categoryConfig[cat] || { icon: Receipt, color: "text-slate-500", bg: "bg-slate-100", bar: "" };
                  const Icon = cfg.icon;
                  return (
                    <div key={exp.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${cfg.bg}`}><Icon size={18} className={cfg.color} /></div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{exp.description || "Expense"}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {cat} · {new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-rose-600">−₹{exp.amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
