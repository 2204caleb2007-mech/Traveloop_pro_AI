import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import {
  Users, Map, TrendingUp, Globe2, Activity,
  Zap, Star, BarChart3, Award, ArrowUpRight,
  MapPin, Calendar, Compass, Shield,
} from "lucide-react";
import { useMemo } from "react";
import { tripStore } from "@/lib/tripStore";
import { useAuth } from "@/hooks/useTrips";
import { CITIES, ACTIVITIES } from "@/lib/mockData";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — GlobeX AI" },
      { name: "description", content: "Analytics and platform insights for GlobeX AI administrators." },
    ],
  }),
  component: AdminDashboard,
});

// ─── Helpers ──────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, sub, color, delay = 0,
}: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-5 flex items-start gap-4"
    >
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="font-display font-bold text-2xl">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ─── Mini Bar ─────────────────────────────────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const { user } = useAuth();
  const trips = tripStore.getAll();

  if (user?.email !== "admin@globex.ai") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Access Denied</p>
      </div>
    );
  }

  const stats = useMemo(() => {
    const ongoing = trips.filter(t => t.status === "ongoing").length;
    const upcoming = trips.filter(t => t.status === "upcoming").length;
    const completed = trips.filter(t => t.status === "completed").length;
    const totalStops = trips.reduce((s, t) => s + t.stops.length, 0);
    const totalActivities = trips.reduce((s, t) => s + t.stops.reduce((a, st) => a + st.activities.length, 0), 0);
    const totalBudgetSpend = trips.reduce((s, t) => s + t.stops.reduce((a, st) => a + st.activities.reduce((b, ac) => b + ac.cost, 0), 0), 0);

    // destination popularity from trips
    const destCount: Record<string, number> = {};
    trips.forEach(t => t.stops.forEach(s => { destCount[s.city] = (destCount[s.city] ?? 0) + 1; }));
    const topDest = Object.entries(destCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

    // activity category breakdown
    const catCount: Record<string, number> = {};
    ACTIVITIES.forEach(a => { catCount[a.category] = (catCount[a.category] ?? 0) + 1; });
    const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]);

    // city popularity from static CITIES data (by rating)
    const topCities = [...CITIES].sort((a, b) => b.popularityRating - a.popularityRating).slice(0, 6);

    // monthly trend (mock — distribute trips across months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const monthlyTrips = months.map((m, i) => ({ month: m, count: Math.max(1, Math.round(trips.length * (0.6 + Math.sin(i) * 0.4))) }));

    return { ongoing, upcoming, completed, totalStops, totalActivities, totalBudgetSpend, topDest, topCats, topCities, monthlyTrips };
  }, [trips]);

  const maxMonthly = Math.max(...stats.monthlyTrips.map(m => m.count));
  const maxCat = Math.max(...stats.topCats.map(c => c[1]));

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 mx-auto max-w-6xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="relative">
              <Shield className="h-6 w-6 text-primary" />
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            </div>
            <h1 className="font-display font-bold text-3xl">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive border border-destructive/30 font-medium">
              Admin Only
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Platform analytics, engagement metrics, and tourism insights</p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Map className="h-5 w-5 text-primary" />} label="Total Trips" value={trips.length}
            sub={`${stats.ongoing} active now`} color="bg-primary/15" delay={0} />
          <StatCard icon={<Globe2 className="h-5 w-5 text-neon" />} label="Destinations" value={CITIES.length}
            sub="Across 5 regions" color="bg-neon/15" delay={0.05} />
          <StatCard icon={<Zap className="h-5 w-5 text-accent" />} label="Activities" value={ACTIVITIES.length}
            sub={`${stats.totalActivities} planned`} color="bg-accent/15" delay={0.1} />
          <StatCard icon={<TrendingUp className="h-5 w-5 text-emerald-400" />} label="Completed" value={stats.completed}
            sub={`${stats.upcoming} upcoming`} color="bg-emerald-400/15" delay={0.15} />
        </div>

        {/* Row 2: Top Destinations + Trip Status */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* Top Destinations by Popularity */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" /> Top Destinations
              </h2>
              <Link to="/cities" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                All <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {stats.topCities.map((city, i) => (
                <div key={city.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={city.image} alt={city.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{city.name}</span>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{city.popularityRating}★</span>
                    </div>
                    <MiniBar
                      value={city.popularityRating}
                      max={5}
                      color={i === 0 ? "bg-primary" : i === 1 ? "bg-neon" : "bg-accent"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Trip Status Breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-5">
            <h2 className="font-display font-semibold flex items-center gap-2 mb-5">
              <BarChart3 className="h-4 w-4 text-primary" /> Trip Status Overview
            </h2>

            {/* Donut-style ring */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(1 0 0 / 0.05)" strokeWidth="3" />
                  {/* Ongoing */}
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.78 0.18 220)" strokeWidth="3"
                    strokeDasharray={`${(stats.ongoing / Math.max(trips.length, 1)) * 100} 100`} strokeLinecap="round" />
                  {/* Upcoming — offset */}
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.65 0.24 300)" strokeWidth="3"
                    strokeDasharray={`${(stats.upcoming / Math.max(trips.length, 1)) * 100} 100`}
                    strokeDashoffset={`-${(stats.ongoing / Math.max(trips.length, 1)) * 100}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-bold text-2xl">{trips.length}</span>
                  <span className="text-xs text-muted-foreground">trips</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Ongoing", count: stats.ongoing, color: "text-primary", bg: "bg-primary/15" },
                { label: "Upcoming", count: stats.upcoming, color: "text-accent", bg: "bg-accent/15" },
                { label: "Completed", count: stats.completed, color: "text-neon", bg: "bg-neon/15" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                  <p className={`font-display font-bold text-xl ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Stops & Activities */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-3 text-center">
                <p className="font-bold text-lg text-gradient">{stats.totalStops}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><MapPin className="h-3 w-3" />Stops planned</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <p className="font-bold text-lg text-gradient">{stats.totalActivities}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Activity className="h-3 w-3" />Activities</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Row 3: Monthly Trend + Activity Categories */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* Monthly Trip Trend */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-5">
            <h2 className="font-display font-semibold flex items-center gap-2 mb-5">
              <Calendar className="h-4 w-4 text-primary" /> Trip Activity Trend
            </h2>
            <div className="flex items-end gap-2 h-36">
              {stats.monthlyTrips.map((m, i) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{m.count}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.count / maxMonthly) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                    className="w-full rounded-t-lg"
                    style={{
                      background: i === stats.monthlyTrips.length - 1
                        ? "linear-gradient(to top, oklch(0.78 0.18 220), oklch(0.65 0.24 300))"
                        : "oklch(1 0 0 / 0.08)"
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{m.month}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Categories */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass rounded-2xl p-5">
            <h2 className="font-display font-semibold flex items-center gap-2 mb-5">
              <Compass className="h-4 w-4 text-primary" /> Activity Categories
            </h2>
            <div className="space-y-3">
              {stats.topCats.map(([cat, count], i) => {
                const colors = ["bg-primary", "bg-accent", "bg-neon", "bg-emerald-400", "bg-amber-400", "bg-rose-400"];
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 truncate">{cat}</span>
                    <MiniBar value={count} max={maxCat} color={colors[i % colors.length]} />
                    <span className="text-xs font-medium w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Row 4: All Trips Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold flex items-center gap-2">
              <Map className="h-4 w-4 text-primary" /> All Trips
            </h2>
            <span className="text-xs text-muted-foreground">{trips.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left pb-3 pr-4 font-medium">Trip Name</th>
                  <th className="text-left pb-3 pr-4 font-medium">Status</th>
                  <th className="text-left pb-3 pr-4 font-medium">Stops</th>
                  <th className="text-left pb-3 pr-4 font-medium">Duration</th>
                  <th className="text-left pb-3 font-medium">Start Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {trips.map(trip => {
                  const nights = Math.max(1, Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000));
                  const statusColor: Record<string, string> = {
                    ongoing: "text-neon bg-neon/10 border-neon/30",
                    upcoming: "text-primary bg-primary/10 border-primary/30",
                    completed: "text-muted-foreground bg-muted/40 border-border",
                  };
                  return (
                    <tr key={trip.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3 pr-4 font-medium truncate max-w-[160px]">{trip.name}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColor[trip.status]}`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{trip.stops.length}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{nights}d</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Row 5: Destination Region Breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="glass rounded-2xl p-5">
          <h2 className="font-display font-semibold flex items-center gap-2 mb-5">
            <Globe2 className="h-4 w-4 text-primary" /> Destinations by Region
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(
              CITIES.reduce((acc: Record<string, number>, c) => {
                acc[c.region] = (acc[c.region] ?? 0) + 1;
                return acc;
              }, {})
            ).map(([region, count]) => (
              <div key={region} className="glass rounded-xl p-3 text-center">
                <p className="font-display font-bold text-xl text-gradient">{count}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{region}</p>
              </div>
            ))}
          </div>

          {/* Top rated per region */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-3">Top rated destinations</p>
            <div className="flex flex-wrap gap-2">
              {[...CITIES].sort((a, b) => b.popularityRating - a.popularityRating).slice(0, 8).map(c => (
                <span key={c.id} className="flex items-center gap-1 text-xs px-2.5 py-1 glass rounded-lg">
                  <Star className="h-3 w-3 text-amber-400" />{c.name}
                  <span className="text-muted-foreground">{c.popularityRating}</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
