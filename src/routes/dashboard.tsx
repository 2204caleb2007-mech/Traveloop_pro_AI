import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  Eye,
  Edit3,
  Search,
  SlidersHorizontal,
  LogOut,
  Globe2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTrips, useAuth } from "@/hooks/useTrips";
import { tripStore, auth, type Trip } from "@/lib/tripStore";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Trips — GlobeX AI" },
      { name: "description", content: "View and manage all your travel plans." },
    ],
  }),
  component: DashboardPage,
});

const STATUS_ORDER: Trip["status"][] = ["ongoing", "upcoming", "completed"];
const STATUS_LABEL: Record<Trip["status"], string> = {
  ongoing: "Ongoing",
  upcoming: "Upcoming",
  completed: "Completed",
};
const STATUS_COLOR: Record<Trip["status"], string> = {
  ongoing: "bg-neon/20 text-neon border-neon/30",
  upcoming: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-muted text-muted-foreground border-border",
};

function DashboardPage() {
  const navigate = useNavigate();
  const trips = useTrips();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Trip["status"]>("all");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...trips];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    if (filter !== "all") list = list.filter((t) => t.status === filter);
    list.sort((a, b) =>
      sortBy === "name"
        ? a.name.localeCompare(b.name)
        : new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    return list;
  }, [trips, search, filter, sortBy]);

  const grouped = useMemo(() => {
    const g: Partial<Record<Trip["status"], Trip[]>> = {};
    for (const status of STATUS_ORDER) {
      const items = filtered.filter((t) => t.status === status);
      if (items.length) g[status] = items;
    }
    return g;
  }, [filtered]);

  function confirmDelete(id: string) {
    tripStore.delete(id);
    setDeleteId(null);
  }

  function handleLogout() {
    auth.logout();
    navigate({ to: "/" });
  }

  const nightsCount = (t: Trip) => {
    const diff = new Date(t.endDate).getTime() - new Date(t.startDate).getTime();
    return Math.max(1, Math.round(diff / 86400000));
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div>
            <p className="text-muted-foreground text-sm mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Hello, {user?.name ?? "Explorer"}
            </p>
            <h1 className="font-display text-3xl font-bold">My Trips</h1>
          </div>
          <div className="flex gap-2">
            <Link
              to="/trips/new"
              id="plan-new-trip-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-transform text-sm"
            >
              <Plus className="h-4 w-4" />
              Plan a Trip
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl glass hover:bg-destructive/20 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Search + Filters */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="trip-search"
              type="text"
              placeholder="Search trips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>
          <button
            id="toggle-filters-btn"
            onClick={() => setShowFilters((v) => !v)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium glass hover:bg-white/5 transition-colors inline-flex items-center gap-2 ${showFilters ? "border-primary/40" : ""}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="glass rounded-2xl p-4 flex flex-wrap gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Filter by status</p>
                  <div className="flex gap-2 flex-wrap">
                    {(["all", "ongoing", "upcoming", "completed"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "glass hover:bg-white/5"}`}
                      >
                        {s === "all" ? "All Trips" : STATUS_LABEL[s as Trip["status"]]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Sort by</p>
                  <div className="flex gap-2">
                    {(["date", "name"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${sortBy === s ? "bg-primary text-primary-foreground" : "glass hover:bg-white/5"}`}
                      >
                        {s === "date" ? "Date" : "Name"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trip groups */}
        {Object.keys(grouped).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 space-y-4"
          >
            <Globe2 className="h-16 w-16 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">
              {search ? "No trips match your search." : "No trips yet. Plan your first adventure!"}
            </p>
            <Link to="/trips/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-transform text-sm">
              <Plus className="h-4 w-4" /> Plan First Trip
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {STATUS_ORDER.filter((s) => grouped[s]?.length).map((status) => (
              <section key={status}>
                <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${status === "ongoing" ? "bg-neon animate-pulse-glow" : status === "upcoming" ? "bg-primary" : "bg-muted-foreground"}`} />
                  {STATUS_LABEL[status]}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {grouped[status]!.map((trip, i) => (
                      <motion.article
                        key={trip.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.06 }}
                        className="glass rounded-2xl p-5 group hover:border-primary/30 transition-colors relative overflow-hidden"
                      >
                        {/* neon accent */}
                        <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLOR[trip.status]} mb-2`}>
                              {STATUS_LABEL[trip.status]}
                            </span>
                            <h3 className="font-display font-semibold text-lg leading-tight">{trip.name}</h3>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{trip.description}</p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-5">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            {" – "}
                            {new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {nightsCount(trip)} nights
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {trip.stops.length} {trip.stops.length === 1 ? "stop" : "stops"}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to="/trips/$tripId/itinerary"
                            params={{ tripId: trip.id }}
                            id={`view-trip-${trip.id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl glass text-xs font-medium hover:bg-white/10 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </Link>
                          <Link
                            to="/trips/$tripId/itinerary"
                            params={{ tripId: trip.id }}
                            search={{ edit: true } as any}
                            id={`edit-trip-${trip.id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl glass text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" /> Edit
                          </Link>
                          <Link
                            to="/trips/$tripId/journal"
                            params={{ tripId: trip.id }}
                            id={`journal-trip-${trip.id}`}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl glass text-xs font-medium hover:bg-accent/10 hover:text-accent transition-colors"
                            title="Trip Journal"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            id={`delete-trip-${trip.id}`}
                            onClick={() => setDeleteId(trip.id)}
                            className="p-2 rounded-xl glass hover:bg-destructive/20 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 max-w-sm w-full"
            >
              <h3 className="font-display font-semibold text-lg mb-2">Delete Trip?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This action cannot be undone. All stops and activities will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl glass text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="confirm-delete-btn"
                  onClick={() => confirmDelete(deleteId)}
                  className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
