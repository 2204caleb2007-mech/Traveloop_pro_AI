import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Plus, Trash2, RotateCcw, Star, Check, ChevronDown, ChevronUp,
  Package, FileText, Cpu, Droplets, Glasses, Box, X, Layers,
} from "lucide-react";
import { useState, useMemo } from "react";
import { usePacking, useTrip } from "@/hooks/useTrips";
import { packingStore, CATEGORY_TEMPLATES, type PackingCategory } from "@/lib/packingStore";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/trips/$tripId/packing")({
  head: () => ({ meta: [{ title: "Packing Checklist — GlobeX AI" }] }),
  component: PackingPage,
});

const CAT_ICON: Record<PackingCategory, React.ReactNode> = {
  Documents: <FileText className="h-4 w-4" />,
  Clothing: <Package className="h-4 w-4" />,
  Electronics: <Cpu className="h-4 w-4" />,
  Toiletries: <Droplets className="h-4 w-4" />,
  Accessories: <Glasses className="h-4 w-4" />,
  Other: <Box className="h-4 w-4" />,
};

const CAT_COLOR: Record<PackingCategory, string> = {
  Documents: "text-blue-400 bg-blue-400/10",
  Clothing: "text-purple-400 bg-purple-400/10",
  Electronics: "text-cyan-400 bg-cyan-400/10",
  Toiletries: "text-emerald-400 bg-emerald-400/10",
  Accessories: "text-amber-400 bg-amber-400/10",
  Other: "text-gray-400 bg-gray-400/10",
};

const CATEGORIES: PackingCategory[] = ["Documents", "Clothing", "Electronics", "Toiletries", "Accessories", "Other"];

function PackingPage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const trip = useTrip(tripId);
  const items = usePacking(tripId);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<PackingCategory | "All">("All");
  const [showPacked, setShowPacked] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<PackingCategory>>(new Set());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [addingCat, setAddingCat] = useState<PackingCategory | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const filteredItems = useMemo(() => {
    let list = items;
    if (search) { const q = search.toLowerCase(); list = list.filter(i => i.label.toLowerCase().includes(q)); }
    if (filterCat !== "All") list = list.filter(i => i.category === filterCat);
    if (!showPacked) list = list.filter(i => !i.packed);
    return list;
  }, [items, search, filterCat, showPacked]);

  const totalCount = items.length;
  const packedCount = items.filter(i => i.packed).length;
  const pct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const grouped = useMemo(() => {
    const map: Partial<Record<PackingCategory, typeof filteredItems>> = {};
    for (const cat of CATEGORIES) {
      const catItems = filteredItems.filter(i => i.category === cat);
      if (catItems.length > 0) map[cat] = catItems;
    }
    return map;
  }, [filteredItems]);

  function toggleCollapse(cat: PackingCategory) {
    setCollapsed(prev => { const s = new Set(prev); s.has(cat) ? s.delete(cat) : s.add(cat); return s; });
  }

  function handleAdd(cat: PackingCategory) {
    if (!newLabel.trim()) return;
    packingStore.add({ tripId, label: newLabel.trim(), category: cat, packed: false, priority: false });
    setNewLabel("");
    setAddingCat(null);
  }

  function handleEdit(id: string) {
    packingStore.update(id, { label: editLabel.trim() });
    setEditId(null);
  }

  if (!trip) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Trip not found.</p></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate({ to: "/trips/$tripId/itinerary", params: { tripId } })}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />Back to Itinerary
          </button>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold mb-0.5">Packing Checklist</h1>
              <p className="text-muted-foreground text-sm">{trip.name}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button id="apply-template-btn" onClick={() => packingStore.applyTemplate(tripId)}
                className="px-3 py-2 rounded-xl glass text-xs font-medium hover:bg-white/10 transition-colors flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />Template
              </button>
              <button id="reset-packing-btn" onClick={() => setShowResetConfirm(true)}
                className="p-2 rounded-xl glass hover:bg-destructive/20 hover:text-destructive transition-colors" title="Reset all">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="glass rounded-2xl p-5 mb-6">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-3xl font-display font-bold text-gradient">{pct}%</p>
                <p className="text-sm text-muted-foreground">packed</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{packedCount}<span className="text-muted-foreground text-sm font-normal"> / {totalCount}</span></p>
                <p className="text-xs text-muted-foreground">{totalCount - packedCount} remaining</p>
              </div>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-primary relative">
                {pct === 100 && <div className="absolute inset-0 animate-pulse bg-white/20 rounded-full" />}
              </motion.div>
            </div>
            {pct === 100 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-neon font-medium mt-3">
                🎉 All packed! You're ready for takeoff!
              </motion.p>
            )}
          </div>

          {/* Category stats */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
            {CATEGORIES.map(cat => {
              const catItems = items.filter(i => i.category === cat);
              const catPacked = catItems.filter(i => i.packed).length;
              if (catItems.length === 0) return null;
              return (
                <button key={cat} onClick={() => setFilterCat(filterCat === cat ? "All" : cat)}
                  className={`glass rounded-xl p-2.5 text-center hover:bg-white/10 transition-colors ${filterCat === cat ? "border-primary/40" : ""}`}>
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-1.5 ${CAT_COLOR[cat]}`}>{CAT_ICON[cat]}</div>
                  <div className="text-xs font-medium leading-tight">{cat.split(" ")[0]}</div>
                  <div className="text-xs text-muted-foreground">{catPacked}/{catItems.length}</div>
                </button>
              );
            })}
          </div>

          {/* Search + filters */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input id="packing-search" type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-input/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition" />
            </div>
            <button onClick={() => setShowPacked(v => !v)}
              className={`px-3 py-2.5 rounded-xl text-xs font-medium glass transition-colors ${!showPacked ? "border-primary/40 text-primary" : "hover:bg-white/5"}`}>
              {showPacked ? "Hide Packed" : "Show All"}
            </button>
          </div>

          {/* Grouped checklist */}
          <div className="space-y-4">
            {Object.keys(grouped).length === 0 && (
              <div className="text-center py-16">
                <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No items yet. Click "Template" to get started!</p>
              </div>
            )}
            {CATEGORIES.filter(c => grouped[c]?.length).map(cat => {
              const catItems = grouped[cat]!;
              const catPacked = catItems.filter(i => i.packed).length;
              const isCollapsed = collapsed.has(cat);
              return (
                <div key={cat} className="glass rounded-2xl overflow-hidden">
                  {/* Category header */}
                  <button onClick={() => toggleCollapse(cat)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors">
                    <div className={`p-1.5 rounded-lg ${CAT_COLOR[cat]}`}>{CAT_ICON[cat]}</div>
                    <span className="font-semibold flex-1 text-left">{cat}</span>
                    <span className="text-xs text-muted-foreground">{catPacked}/{catItems.length}</span>
                    {/* mini progress */}
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${catItems.length > 0 ? (catPacked / catItems.length) * 100 : 0}%` }} />
                    </div>
                    {isCollapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
                  </button>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-4 space-y-1.5 border-t border-border pt-3">
                          {catItems.map(item => (
                            <motion.div key={item.id} layout
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-colors ${item.packed ? "opacity-60" : "hover:bg-white/3"}`}>
                              {/* Checkbox */}
                              <button id={`toggle-${item.id}`} onClick={() => packingStore.toggle(item.id)}
                                className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${item.packed ? "bg-primary border-primary" : "border-border hover:border-primary"}`}>
                                {item.packed && <Check className="h-3 w-3 text-primary-foreground" />}
                              </button>
                              {/* Label */}
                              {editId === item.id ? (
                                <input type="text" value={editLabel} onChange={e => setEditLabel(e.target.value)}
                                  onKeyDown={e => { if (e.key === "Enter") handleEdit(item.id); if (e.key === "Escape") setEditId(null); }}
                                  autoFocus className="flex-1 bg-input/50 border border-primary rounded-lg px-2.5 py-1 text-sm focus:outline-none" />
                              ) : (
                                <span onDoubleClick={() => { setEditId(item.id); setEditLabel(item.label); }}
                                  className={`flex-1 text-sm ${item.packed ? "line-through text-muted-foreground" : ""}`}>{item.label}</span>
                              )}
                              {editId === item.id && (
                                <div className="flex gap-1">
                                  <button onClick={() => handleEdit(item.id)} className="p-1 rounded hover:bg-primary/20 text-primary"><Check className="h-3.5 w-3.5" /></button>
                                  <button onClick={() => setEditId(null)} className="p-1 rounded hover:bg-white/5"><X className="h-3.5 w-3.5" /></button>
                                </div>
                              )}
                              {/* Priority star */}
                              <button id={`priority-${item.id}`} onClick={() => packingStore.togglePriority(item.id)}
                                className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-all ${item.priority ? "opacity-100 text-amber-400" : "text-muted-foreground hover:text-amber-400"}`}>
                                <Star className={`h-3.5 w-3.5 ${item.priority ? "fill-current" : ""}`} />
                              </button>
                              {/* Delete */}
                              <button id={`delete-pack-${item.id}`} onClick={() => packingStore.delete(item.id)}
                                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all text-muted-foreground">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </motion.div>
                          ))}

                          {/* Add item inline */}
                          {addingCat === cat ? (
                            <div className="flex gap-2 mt-2">
                              <input id={`new-item-${cat}`} type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") handleAdd(cat); if (e.key === "Escape") setAddingCat(null); }}
                                placeholder={`Add ${cat.toLowerCase()} item...`} autoFocus
                                className="flex-1 bg-input/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                              <button onClick={() => handleAdd(cat)} className="p-2 rounded-xl bg-primary text-primary-foreground"><Check className="h-4 w-4" /></button>
                              <button onClick={() => setAddingCat(null)} className="p-2 rounded-xl glass"><X className="h-4 w-4" /></button>
                            </div>
                          ) : (
                            <button id={`add-item-${cat}`} onClick={() => setAddingCat(cat)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground text-xs hover:text-primary hover:bg-white/3 transition-colors">
                              <Plus className="h-3.5 w-3.5" />Add item to {cat}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Add to "Other" category */}
          {filterCat === "All" && !search && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              {addingCat === "Other" && !grouped["Other"] ? (
                <div className="flex gap-2">
                  <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleAdd("Other"); if (e.key === "Escape") setAddingCat(null); }}
                    placeholder="Add a custom item..." autoFocus
                    className="flex-1 bg-input/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <button onClick={() => handleAdd("Other")} className="p-2.5 rounded-xl bg-primary text-primary-foreground"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setAddingCat(null)} className="p-2.5 rounded-xl glass"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <button id="add-custom-item-btn" onClick={() => setAddingCat("Other")}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
                  <Plus className="h-4 w-4" />Add Custom Item
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Reset confirm */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-display font-semibold text-lg mb-2">Reset Checklist?</h3>
              <p className="text-sm text-muted-foreground mb-6">This will mark all items as unpacked. Items won't be deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 rounded-xl glass text-sm">Cancel</button>
                <button id="confirm-reset-btn" onClick={() => { packingStore.resetAll(tripId); setShowResetConfirm(false); }}
                  className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium">Reset All</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
