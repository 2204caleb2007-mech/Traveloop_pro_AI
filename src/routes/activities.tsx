import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Star, DollarSign, Clock, Plus, X, Heart, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { ACTIVITIES, type ActivityItem, type ActivityCategory } from "@/lib/mockData";
import { Navbar } from "@/components/Navbar";
import { AddToTripModal } from "@/components/AddToTripModal";
import { tripStore } from "@/lib/tripStore";

export const Route = createFileRoute("/activities")({
  head: () => ({ meta: [{ title: "Browse Activities — GlobeX AI" }, { name: "description", content: "Discover sightseeing, food tours, and adventure activities for your trip." }] }),
  component: ActivitiesPage,
});

const CATEGORIES: ActivityCategory[] = ["Sightseeing", "Food & Dining", "Adventure", "Culture", "Nightlife", "Relaxation"];

function ActivitiesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | "All">("All");
  const [maxCost, setMaxCost] = useState(15000);
  const [sortBy, setSortBy] = useState<"rating" | "cost" | "name">("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<ActivityItem | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetAct, setTargetAct] = useState<ActivityItem | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const filtered = useMemo(() => {
    let list = [...ACTIVITIES];
    if (search) { const q = search.toLowerCase(); list = list.filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.city.toLowerCase().includes(q)); }
    if (activeCategory !== "All") list = list.filter(a => a.category === activeCategory);
    list = list.filter(a => a.estimatedCost <= maxCost);
    list.sort((a, b) => sortBy === "rating" ? b.rating - a.rating : sortBy === "cost" ? a.estimatedCost - b.estimatedCost : a.name.localeCompare(b.name));
    return list;
  }, [search, activeCategory, maxCost, sortBy]);

  const fmtCurrency = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  function toggleFavorite(id: string) {
    setFavorites(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  function handleAddClick(act: ActivityItem) {
    setTargetAct(act);
    setIsModalOpen(true);
  }

  function handleSelectTrip(tripId: string) {
    if (!targetAct) return;
    const trip = tripStore.getById(tripId);
    if (trip) {
      let stop = trip.stops.find(s => s.city === targetAct.city);
      if (!stop) {
        stop = tripStore.addStop(tripId, { city: targetAct.city, startDate: trip.startDate, endDate: trip.endDate });
      }
      tripStore.addActivity(tripId, stop.id, { 
        time: "10:00", 
        title: targetAct.name, 
        cost: targetAct.estimatedCost, 
        notes: targetAct.description 
      });
      setAdded(prev => new Set([...prev, targetAct.id]));
      setIsModalOpen(false);
      setToastMsg(`Added to ${trip.name}!`);
      setTimeout(() => setToastMsg(""), 3000);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-1">Browse Activities</h1>
          <p className="text-muted-foreground text-sm">Discover experiences to add to your itinerary</p>
        </motion.div>

        {/* Search */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input id="activity-search" type="text" placeholder="Search activities, cities..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition" />
          </div>
          <button id="activity-filter-btn" onClick={() => setShowFilters(v => !v)}
            className={`px-4 py-2.5 rounded-xl text-sm glass flex items-center gap-2 hover:bg-white/5 transition-colors ${showFilters ? "border-primary/40" : ""}`}>
            <SlidersHorizontal className="h-4 w-4" /><span className="hidden sm:inline">Filters</span>
          </button>
        </div>



        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              <div className="glass rounded-2xl p-6 space-y-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Categories</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button 
                      id="cat-all"
                      onClick={() => setActiveCategory("All")}
                      className={`shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                        activeCategory === "All" 
                          ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                          : "bg-[#0f172a]/50 border border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      All
                    </button>
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat} 
                        id={`cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => setActiveCategory(cat)}
                        className={`shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                          activeCategory === cat 
                            ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                            : "bg-[#0f172a]/50 border border-white/10 text-white hover:bg-white/10"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Max Cost: <span className="text-foreground font-bold">{fmtCurrency(maxCost)}</span></p>
                    <input type="range" min={0} max={15000} step={500} value={maxCost} onChange={e => setMaxCost(Number(e.target.value))} className="w-full accent-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Sort by</p>
                    <div className="flex gap-2">
                      {(["rating", "cost", "name"] as const).map(s => (
                        <button key={s} onClick={() => setSortBy(s)}
                          className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all duration-300 ${sortBy === s ? "bg-cyan-400 text-black" : "bg-[#0f172a]/50 border border-white/10 text-white hover:bg-white/10"}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-sm text-muted-foreground mb-4">{filtered.length} activities</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((act, i) => (
            <motion.div key={act.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl flex flex-col group hover:border-primary/30 transition-colors overflow-hidden">
              <div className="h-40 relative">
                <img src={act.image} alt={act.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button id={`fav-activity-${act.id}`} onClick={() => toggleFavorite(act.id)}
                  className={`absolute top-3 right-3 p-1.5 rounded-lg glass transition-colors ${favorites.has(act.id) ? "text-red-400" : "text-white hover:text-red-400 hover:bg-white/20"}`}>
                  <Heart className={`h-4 w-4 ${favorites.has(act.id) ? "fill-current" : ""}`} />
                </button>
                <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest glass px-2 py-1 rounded-md font-semibold text-white flex items-center gap-1.5">
                  {act.category}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-display font-semibold mb-1 text-lg leading-tight">{act.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">{act.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-5">
                  <span className="flex items-center gap-1 font-medium text-foreground"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />{act.rating}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{act.duration}</span>
                  <span className="flex items-center gap-1 font-medium"><DollarSign className="h-3.5 w-3.5 text-neon" />{fmtCurrency(act.estimatedCost)}</span>
                  <span className="flex items-center gap-1">📍 {act.city}</span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => setPreview(act)} className="flex-1 py-2.5 rounded-xl glass text-xs font-medium hover:bg-white/10 transition-colors">Details</button>
                  <button id={`add-activity-${act.id}`} onClick={() => handleAddClick(act)} disabled={added.has(act.id)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${added.has(act.id) ? "glass text-muted-foreground" : "bg-primary text-primary-foreground hover:scale-105"}`}>
                    {added.has(act.id) ? <><Check className="h-3.5 w-3.5" />Added</> : <><Plus className="h-3.5 w-3.5" />Add</>}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No activities match your filters.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreview(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="glass rounded-3xl overflow-hidden max-w-md w-full border border-white/10 shadow-2xl">
              <div className="h-56 relative">
                <img src={preview.image} alt={preview.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => toggleFavorite(preview.id)} className={`p-2 rounded-xl glass transition-colors ${favorites.has(preview.id) ? "text-red-400" : "hover:bg-white/20 text-white"}`}>
                    <Heart className={`h-4 w-4 ${favorites.has(preview.id) ? "fill-current" : ""}`} />
                  </button>
                  <button onClick={() => setPreview(null)} className="p-2 rounded-xl glass hover:bg-white/20 transition-colors text-white"><X className="h-4 w-4" /></button>
                </div>
                <div className="absolute bottom-4 left-6">
                  <span className="text-[10px] uppercase tracking-widest glass px-2.5 py-1 rounded-md mb-2 inline-block font-semibold text-white border border-white/10">
                    {preview.category}
                  </span>
                  <h2 className="font-display text-3xl font-bold text-white leading-tight">{preview.name}</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-medium text-primary mb-4 flex items-center gap-1.5">📍 {preview.city}</p>
                <p className="text-sm mb-6 leading-relaxed text-muted-foreground">{preview.description}</p>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[{ label: "Rating", value: `${preview.rating}` }, { label: "Duration", value: preview.duration }, { label: "Est. Cost", value: fmtCurrency(preview.estimatedCost) }].map(s => (
                    <div key={s.label} className="glass rounded-xl p-3 text-center border border-white/5">
                      <div className="font-semibold text-sm text-foreground">{s.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <button id={`preview-add-act-${preview.id}`} onClick={() => { handleAddClick(preview); setPreview(null); }} disabled={added.has(preview.id)}
                  className={`w-full py-3.5 rounded-xl font-bold transition-transform text-sm flex items-center justify-center gap-2 ${added.has(preview.id) ? "glass text-muted-foreground" : "bg-primary text-primary-foreground hover:scale-[1.02]"}`}>
                  {added.has(preview.id) ? <><Check className="h-4 w-4" />Added to Itinerary</> : <><Plus className="h-4 w-4" />Add to Itinerary</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddToTripModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add Activity to Trip" 
        onSelectTrip={handleSelectTrip} 
      />

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass bg-primary/20 border-primary/50 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg"
          >
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
