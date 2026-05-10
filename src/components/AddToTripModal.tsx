import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useTrips } from "@/hooks/useTrips";
import { tripStore } from "@/lib/tripStore";

interface AddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onSelectTrip: (tripId: string) => void;
}

export function AddToTripModal({ isOpen, onClose, title = "Which trip would you like to add this to?", onSelectTrip }: AddToTripModalProps) {
  const trips = useTrips();
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [newTripStart, setNewTripStart] = useState("");
  const [newTripEnd, setNewTripEnd] = useState("");

  const filteredTrips = useMemo(() => {
    if (!search) return trips;
    return trips.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  }, [trips, search]);

  const handleCreateTrip = () => {
    if (!newTripName.trim() || !newTripStart || !newTripEnd) return;
    const newTrip = tripStore.add({
      name: newTripName.trim(),
      startDate: newTripStart,
      endDate: newTripEnd,
      description: "A newly planned trip",
    });
    setIsCreating(false);
    onSelectTrip(newTrip.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass rounded-3xl w-full max-w-lg overflow-hidden pointer-events-auto flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="font-display font-semibold text-xl">{title}</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                {isCreating ? (
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-primary mb-2">Create New Trip</h3>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Trip Name</label>
                      <input type="text" value={newTripName} onChange={e => setNewTripName(e.target.value)} placeholder="e.g. Summer in Europe" className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" autoFocus />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                        <input type="date" value={newTripStart} onChange={e => setNewTripStart(e.target.value)} className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                        <input type="date" value={newTripEnd} onChange={e => setNewTripEnd(e.target.value)} className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={handleCreateTrip} disabled={!newTripName || !newTripStart || !newTripEnd} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50">Create & Add</button>
                      <button onClick={() => setIsCreating(false)} className="px-4 py-2.5 rounded-xl glass text-sm hover:bg-white/5">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative mb-4">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="Search trips..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-input/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>

                    <button onClick={() => setIsCreating(true)} className="w-full mb-4 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors">
                      <Plus className="h-4 w-4" /> Create New Trip
                    </button>

                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 mt-4">Your Trips</p>
                      {filteredTrips.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No trips found.</p>
                      ) : (
                        filteredTrips.map(trip => (
                          <button key={trip.id} onClick={() => onSelectTrip(trip.id)} className="w-full text-left glass rounded-2xl p-4 hover:border-primary/40 transition-colors group">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm">{trip.name}</span>
                              <CheckCircle2 className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{trip.stops.length} destinations</span>
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
