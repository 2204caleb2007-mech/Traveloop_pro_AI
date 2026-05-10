import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, MapPin, Star, DollarSign, Plus, X, ArrowLeft, Sun, Shield, Info, Image as ImageIcon, Map as MapIcon, Coffee, Utensils, Navigation, Music, Camera, Backpack, History } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { DESTINATIONS, type Destination } from "@/lib/destinations";
import { useTrips } from "@/hooks/useTrips";
import { Navbar } from "@/components/Navbar";
import { AddToTripModal } from "@/components/AddToTripModal";
import { tripStore } from "@/lib/tripStore";

export const Route = createFileRoute("/cities")({
  head: () => ({ meta: [{ title: "Destinations — GlobeX AI" }, { name: "description", content: "Discover immersive travel destinations." }] }),
  component: DestinationsPage,
});

const REGIONS = ["All", "South Asia", "Europe", "Southeast Asia", "Oceania", "North America"];
const ADVENTURE_LEVELS = ["All", "Low", "Medium", "High"];

function DestinationsPage() {
  const trips = useTrips();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [category, setCategory] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("category") || "All";
    }
    return "All";
  });
  const [budget, setBudget] = useState("All");
  const [adventure, setAdventure] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [activeDest, setActiveDest] = useState<Destination | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetDest, setTargetDest] = useState<Destination | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  
  useEffect(() => {
    if (activeDest) {
      window.scrollTo(0, 0);
    }
  }, [activeDest]);

  const filtered = useMemo(() => {
    let list = [...DESTINATIONS];
    if (search) { const q = search.toLowerCase(); list = list.filter(d => d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q))); }
    if (category !== "All") list = list.filter(d => d.category === category || d.budgetCategory === category || (category === "Budget" && d.budgetCategory === "Budget") || (category === "Luxury" && d.budgetCategory === "Luxury"));
    if (region !== "All") list = list.filter(d => d.region === region);
    if (budget !== "All") list = list.filter(d => d.budgetCategory === budget);
    if (adventure !== "All") list = list.filter(d => d.adventureLevel === adventure);
    return list;
  }, [search, category, region, budget, adventure]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (val === "All") url.searchParams.delete("category");
      else url.searchParams.set("category", val);
      window.history.replaceState({}, "", url.toString());
    }
  };

  function handleAddToTrip(dest: Destination) {
    setTargetDest(dest);
    setIsModalOpen(true);
  }

  function handleSelectTrip(tripId: string) {
    if (!targetDest) return;
    const trip = tripStore.getById(tripId);
    if (trip) {
      tripStore.addStop(tripId, { city: targetDest.name, startDate: trip.startDate, endDate: trip.endDate });
      setAddedIds(prev => new Set([...prev, targetDest.id]));
      setIsModalOpen(false);
      
      setToastMsg(`Added to ${trip.name}!`);
      setTimeout(() => setToastMsg(""), 3000);
    }
  }

  // DETAILED VIEW
  if (activeDest) {
    const cost = activeDest.estimatedCosts;
    return (
      <div className="min-h-screen bg-background">
        {/* Full width immersive header */}
        <div className="relative h-[60vh] min-h-[400px] w-full">
          <img src={activeDest.image} alt={activeDest.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />
          
          <button onClick={() => setActiveDest(null)} className="absolute top-6 left-6 z-10 p-3 rounded-full glass hover:bg-white/20 transition-colors text-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="absolute bottom-10 left-0 w-full px-6 md:px-12 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm font-medium text-white/90">
                <span className="glass px-3 py-1.5 rounded-full">{activeDest.country}</span>
                <span className="glass px-3 py-1.5 rounded-full">{activeDest.region}</span>
                <span className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />{activeDest.popularityScore.toFixed(1)} Rating</span>
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">{activeDest.name}</h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">{activeDest.overview}</p>
            </motion.div>
          </div>
        </div>

        {/* Action bar sticky */}
        <div className="sticky top-0 z-40 glass border-b border-white/5 py-4 px-6 mb-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex gap-4">
              <a href="#overview" className="text-sm font-medium text-muted-foreground hover:text-foreground">Overview</a>
              <a href="#attractions" className="text-sm font-medium text-muted-foreground hover:text-foreground">Attractions</a>
              <a href="#costs" className="text-sm font-medium text-muted-foreground hover:text-foreground">Costs</a>
            </div>
            <button id={`detail-add-${activeDest.id}`} onClick={() => handleAddToTrip(activeDest)} disabled={addedIds.has(activeDest.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${addedIds.has(activeDest.id) ? "glass text-muted-foreground" : "bg-primary text-primary-foreground hover:scale-105"}`}>
              {addedIds.has(activeDest.id) ? "✓ Added to Trip" : <><Plus className="h-4 w-4" />Add to Itinerary</>}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-24 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            


            {/* In-depth info */}
            <section id="overview">
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2"><Info className="h-6 w-6 text-primary" />About {activeDest.name}</h2>
              <div className="glass rounded-3xl p-8 space-y-8">
                <div>
                  <h3 className="text-sm text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2"><History className="h-4 w-4" />Historical Significance</h3>
                  <p className="leading-relaxed">{activeDest.historicalSignificance}</p>
                </div>
                <div className="h-px bg-white/5" />
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2"><Sun className="h-4 w-4" />Weather & Best Time</h3>
                    <p className="mb-2 text-sm">{activeDest.weatherInsights}</p>
                    <p className="text-sm font-medium text-primary">Best time: {activeDest.bestTimeToVisit}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2"><Shield className="h-4 w-4" />Safety & Travel</h3>
                    <p className="mb-2 text-sm">{activeDest.safetyTips}</p>
                    <p className="text-sm text-muted-foreground">{activeDest.transportationDetails}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Attractions / Places */}
            <section id="attractions">
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2"><MapIcon className="h-6 w-6 text-primary" />Must Visit Places</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {activeDest.mustVisitPlaces.map(place => (
                  <div key={place} className="glass rounded-2xl p-5 hover:border-primary/30 transition-colors">
                    <h4 className="font-bold mb-1">{place}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{activeDest.name}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Local Features */}
            <section>
              <h2 className="font-display text-2xl font-bold mb-6">Local Highlights</h2>
              <div className="space-y-4">
                <HighlightRow icon={<Utensils className="h-5 w-5 text-orange-400" />} title="Food Specialties" items={activeDest.localFoodSpecialties} />
                <HighlightRow icon={<Camera className="h-5 w-5 text-emerald-400" />} title="Best Photo Spots" items={activeDest.bestPhotoSpots} />
                <HighlightRow icon={<Backpack className="h-5 w-5 text-blue-400" />} title="Top Experiences" items={activeDest.topExperiences} />
                <HighlightRow icon={<Music className="h-5 w-5 text-purple-400" />} title="Nightlife" items={activeDest.nightlife} />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section id="costs" className="glass rounded-3xl p-6 sticky top-24">
              <h3 className="font-display text-xl font-bold mb-2">Estimated Costs</h3>
              <p className="text-sm text-muted-foreground mb-6">Daily average per person in USD</p>
              
              <div className="text-4xl font-bold mb-8 text-gradient">${cost.dailyAverage} <span className="text-sm font-normal text-muted-foreground">/ day</span></div>
              
              <div className="space-y-4 mb-8">
                <CostItem label="Accommodation" value={cost.hotel} icon={<MapIcon className="h-4 w-4" />} />
                <CostItem label="Food & Dining" value={cost.food} icon={<Utensils className="h-4 w-4" />} />
                <CostItem label="Transportation" value={cost.transport} icon={<Navigation className="h-4 w-4" />} />
                <CostItem label="Attractions" value={cost.attractions} icon={<Camera className="h-4 w-4" />} />
                <CostItem label="Activities" value={cost.activities} icon={<Backpack className="h-4 w-4" />} />
              </div>
              
              <div className="p-4 bg-primary/10 rounded-2xl flex items-center justify-between">
                <span className="text-sm font-medium">Budget Category</span>
                <span className="text-sm font-bold text-primary">{cost.category}</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Explore Destinations</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">Discover curated locations, hidden gems, and iconic cities to build your perfect itinerary.</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input id="dest-search" type="text" placeholder="Search destinations, countries, tags..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-2xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-ring transition shadow-sm" />
          </div>
          
          <div className="sm:w-64 relative">
            <select value={category} onChange={handleCategoryChange} className="w-full appearance-none bg-input/50 border border-border rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-ring transition shadow-sm font-medium">
              <option value="All">All Experiences</option>
              <option value="Beaches">Beaches</option>
              <option value="Mountains">Mountains</option>
              <option value="Historical">Historical</option>
              <option value="Budget">Budget</option>
              <option value="Luxury">Luxury</option>
              <option value="Hidden Gems">Hidden Gems</option>
            </select>
          </div>

          <button onClick={() => setShowFilters(v => !v)}
            className={`px-6 py-3.5 rounded-2xl text-sm font-medium glass flex items-center justify-center gap-2 hover:bg-white/5 transition-colors ${showFilters ? "border-primary/40 text-primary" : ""}`}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-8">
              <div className="glass rounded-3xl p-6 grid sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Region</p>
                  <select value={region} onChange={e => setRegion(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Budget</p>
                  <select value={budget} onChange={e => setBudget(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="All">All</option>
                    <option value="Budget">Budget</option>
                    <option value="Mid-Range">Mid-Range</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Adventure Level</p>
                  <select value={adventure} onChange={e => setAdventure(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {ADVENTURE_LEVELS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <div className="mb-4 text-sm text-muted-foreground font-medium">{filtered.length} destinations found</div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest, i) => (
            <motion.div key={dest.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setActiveDest(dest)}
              className="glass rounded-3xl overflow-hidden cursor-pointer group hover:border-primary/40 transition-all hover:-translate-y-1 shadow-lg hover:shadow-primary/5">
              <div className="h-64 relative">
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="glass px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-white border border-white/20 shadow-sm backdrop-blur-md">{dest.budgetCategory}</span>
                </div>
                
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="font-display text-3xl font-bold text-white mb-1 drop-shadow-md">{dest.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-white/90 font-medium">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{dest.country}</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />{dest.popularityScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-5 leading-relaxed">{dest.overview}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {dest.tags.slice(0, 3).map(tag => <span key={tag} className="text-xs glass px-3 py-1 rounded-full">{tag}</span>)}
                </div>
                <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-primary hover:text-primary-foreground transition-colors font-medium text-sm flex items-center justify-center gap-2">
                  Explore Destination <ArrowLeft className="h-4 w-4 rotate-180" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <AddToTripModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add to Itinerary" 
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

function HighlightRow({ icon, title, items }: { icon: React.ReactNode, title: string, items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="glass rounded-2xl p-5 flex items-start gap-4">
      <div className="p-3 rounded-xl bg-background/50 border border-white/5">{icon}</div>
      <div>
        <h4 className="font-bold mb-2">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {items.map(item => <span key={item} className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/5">{item}</span>)}
        </div>
      </div>
    </div>
  );
}

function CostItem({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-bold">${value}</span>
    </div>
  );
}
