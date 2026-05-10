import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, DollarSign, Target, TrendingUp, AlertTriangle, Check, X } from "lucide-react";
import { useState } from "react";
import { useBudget, useTrip } from "@/hooks/useTrips";
import { budgetStore, type BudgetCategory } from "@/lib/mockData";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/trips/$tripId/budget")({
  head: () => ({ meta: [{ title: "Trip Budget — GlobeX AI" }] }),
  component: BudgetPage,
});

const CATEGORIES: BudgetCategory[] = ["Transportation", "Accommodation", "Activities", "Meals", "Miscellaneous"];
const CAT_EMOJI: Record<BudgetCategory, string> = { Transportation: "✈️", Accommodation: "🏨", Activities: "🎫", Meals: "🍽️", Miscellaneous: "🛍️" };
const CAT_COLOR: Record<BudgetCategory, string> = {
  Transportation: "from-cyan-500 to-blue-500",
  Accommodation: "from-violet-500 to-purple-500",
  Activities: "from-pink-500 to-rose-500",
  Meals: "from-orange-500 to-amber-500",
  Miscellaneous: "from-emerald-500 to-teal-500",
};

function BudgetPage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const trip = useTrip(tripId);
  const { entries, limit } = useBudget(tripId);

  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState<BudgetCategory>("Transportation");
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [editLimit, setEditLimit] = useState(false);
  const [limitInput, setLimitInput] = useState(String(limit ?? ""));

  const total = entries.reduce((s, e) => s + e.amount, 0);
  const fmtCurrency = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  const pct = limit ? Math.min((total / limit) * 100, 100) : 0;
  const overBudget = limit ? total > limit : false;

  const byCategory = CATEGORIES.map(cat => ({
    cat,
    total: entries.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    count: entries.filter(e => e.category === cat).length,
  })).filter(x => x.total > 0);

  function handleAdd() {
    if (!newDesc.trim() || !newAmount) return;
    budgetStore.add({ tripId, category: newCat, description: newDesc.trim(), amount: parseFloat(newAmount), date: newDate });
    setNewDesc(""); setNewAmount(""); setShowAdd(false);
  }

  function handleSetLimit() {
    const val = parseFloat(limitInput);
    if (!isNaN(val) && val > 0) budgetStore.setLimit(tripId, val);
    setEditLimit(false);
  }

  if (!trip) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Trip not found.</p></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate({ to: "/trips/$tripId/itinerary", params: { tripId } })}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />Back to Itinerary
          </button>
          <h1 className="font-display text-3xl font-bold mb-1">Budget & Costs</h1>
          <p className="text-muted-foreground text-sm mb-8">{trip.name}</p>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Spent", value: fmtCurrency(total), icon: <DollarSign className="h-5 w-5" />, accent: "text-neon" },
            { label: "Budget Limit", value: limit ? fmtCurrency(limit) : "Not set", icon: <Target className="h-5 w-5" />, accent: "text-primary" },
            { label: "Avg per Day", value: fmtCurrency(total / Math.max(1, Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000))), icon: <TrendingUp className="h-5 w-5" />, accent: "text-violet" },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4">
              <div className={`${s.accent} mb-2`}>{s.icon}</div>
              <div className="font-display text-xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Budget limit bar */}
        {limit && (
          <div className="glass rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Budget Usage</p>
              {overBudget && <span className="text-xs flex items-center gap-1 text-destructive"><AlertTriangle className="h-3.5 w-3.5" />Over budget!</span>}
              <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${overBudget ? "bg-gradient-to-r from-red-500 to-rose-500" : "bg-primary"}`} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{fmtCurrency(total)} spent</span>
              <span>{limit ? fmtCurrency(limit - total) : ""} remaining</span>
            </div>
          </div>
        )}

        {/* Category breakdown — CSS pie chart via bars */}
        {byCategory.length > 0 && (
          <div className="glass rounded-2xl p-5 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Breakdown by Category</h2>
            <div className="space-y-3">
              {byCategory.sort((a, b) => b.total - a.total).map(({ cat, total: catTotal }) => {
                const w = total > 0 ? (catTotal / total) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">{CAT_EMOJI[cat]} {cat}</span>
                      <span className="font-medium">{fmtCurrency(catTotal)} <span className="text-muted-foreground text-xs">({w.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ duration: 0.8 }}
                        className={`h-full rounded-full bg-gradient-to-r ${CAT_COLOR[cat]}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Budget limit setting */}
        <div className="glass rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-sm mb-0.5">Budget Limit</p>
            <p className="text-xs text-muted-foreground">Set a total budget cap for this trip</p>
          </div>
          {editLimit ? (
            <div className="flex gap-2 items-center">
              <input type="number" value={limitInput} onChange={e => setLimitInput(e.target.value)}
                className="w-32 bg-input/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Amount ₹" />
              <button onClick={handleSetLimit} className="p-2 rounded-lg bg-primary text-primary-foreground"><Check className="h-4 w-4" /></button>
              <button onClick={() => setEditLimit(false)} className="p-2 rounded-lg glass hover:bg-white/5"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <button id="set-budget-limit-btn" onClick={() => { setLimitInput(String(limit ?? "")); setEditLimit(true); }}
              className="px-4 py-2 rounded-xl glass text-sm hover:bg-white/5 transition-colors">
              {limit ? "Edit Limit" : "Set Limit"}
            </button>
          )}
        </div>

        {/* Entries list */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">All Expenses</h2>
          <button id="add-expense-btn" onClick={() => setShowAdd(v => !v)}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:scale-105 transition-transform flex items-center gap-1.5">
            <Plus className="h-4 w-4" />Add Expense
          </button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="glass rounded-2xl p-5 mb-4 space-y-3">
              <h3 className="font-medium text-sm">New Expense</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                  <select value={newCat} onChange={e => setNewCat(e.target.value as BudgetCategory)}
                    className="w-full bg-input/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Amount (₹)</label>
                  <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="0"
                    className="w-full bg-input/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description"
                className="w-full bg-input/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                className="w-full bg-input/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <div className="flex gap-2">
                <button id="save-expense-btn" onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5">
                  <Check className="h-4 w-4" />Save Expense
                </button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl glass text-sm"><X className="h-4 w-4" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {entries.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm">No expenses yet. Add your first one above.</p>}
          {entries.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="glass rounded-xl px-4 py-3 flex items-center gap-3 group hover:border-primary/20 transition-colors">
              <span className="text-xl">{CAT_EMOJI[entry.category]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.description}</p>
                <p className="text-xs text-muted-foreground">{entry.category} · {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </div>
              <span className="text-sm font-semibold text-neon shrink-0">{fmtCurrency(entry.amount)}</span>
              <button onClick={() => budgetStore.delete(entry.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
