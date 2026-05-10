import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  GripVertical,
  ChevronDown,
  ChevronUp,
  LayoutList,
  CalendarDays,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTrip } from "@/hooks/useTrips";
import { tripStore, type Stop, type Activity } from "@/lib/tripStore";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/trips/$tripId/itinerary")({
  head: () => ({
    meta: [
      { title: "Itinerary Builder — GlobeX AI" },
      { name: "description", content: "Build and view your day-by-day trip itinerary." },
    ],
  }),
  component: ItineraryPage,
});

type ViewMode = "list" | "calendar";

function ItineraryPage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const trip = useTrip(tripId);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editMode, setEditMode] = useState(false);
  const [expandedStops, setExpandedStops] = useState<Set<string>>(new Set(["stop-1", "stop-4", "stop-5"]));
  const [stopOrder, setStopOrder] = useState<string[]>(() => trip?.stops.map((s) => s.id) ?? []);

  // Add stop form
  const [showAddStop, setShowAddStop] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [newStopStart, setNewStopStart] = useState("");
  const [newStopEnd, setNewStopEnd] = useState("");
  const [stopErrors, setStopErrors] = useState<Record<string, string>>({});

  // Add activity form
  const [addActStop, setAddActStop] = useState<string | null>(null);
  const [actTitle, setActTitle] = useState("");
  const [actTime, setActTime] = useState("");
  const [actCost, setActCost] = useState("");
  const [actNotes, setActNotes] = useState("");

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Trip not found.</p>
          <Link to="/dashboard" className="text-primary hover:underline text-sm">← Back to Trips</Link>
        </div>
      </div>
    );
  }

  const orderedStops = useMemo(() => {
    const map = new Map(trip.stops.map((s) => [s.id, s]));
    return stopOrder.filter((id) => map.has(id)).map((id) => map.get(id)!);
  }, [trip.stops, stopOrder]);

  function toggleStop(id: string) {
    setExpandedStops((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function validateStop() {
    const e: Record<string, string> = {};
    if (!newCity.trim()) e.city = "City name required";
    if (!newStopStart) e.start = "Start date required";
    if (!newStopEnd) e.end = "End date required";
    if (newStopStart && newStopEnd && newStopEnd < newStopStart) e.end = "End must be after start";
    setStopErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAddStop() {
    if (!validateStop()) return;
    const stop = tripStore.addStop(tripId, { city: newCity.trim(), startDate: newStopStart, endDate: newStopEnd });
    setStopOrder((o) => [...o, stop.id]);
    setExpandedStops((prev) => new Set([...prev, stop.id]));
    setNewCity("");
    setNewStopStart("");
    setNewStopEnd("");
    setStopErrors({});
    setShowAddStop(false);
  }

  function handleDeleteStop(stopId: string) {
    tripStore.deleteStop(tripId, stopId);
    setStopOrder((o) => o.filter((id) => id !== stopId));
  }

  function handleAddActivity(stopId: string) {
    if (!actTitle.trim()) return;
    const cost = parseFloat(actCost) || 0;
    tripStore.addActivity(tripId, stopId, {
      title: actTitle.trim(),
      time: actTime,
      cost,
      notes: actNotes.trim() || undefined,
    });
    setActTitle("");
    setActTime("");
    setActCost("");
    setActNotes("");
    setAddActStop(null);
  }

  const totalBudget = trip.stops.reduce(
    (sum, s) => sum + s.activities.reduce((a, act) => a + act.cost, 0),
    0
  );
  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 mx-auto max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            My Trips
          </button>

          {trip.coverPhoto && (
            <div
              className="w-full h-40 rounded-2xl mb-5 bg-cover bg-center"
              style={{ backgroundImage: `url(${trip.coverPhoto})` }}
            />
          )}

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold mb-1">{trip.name}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {fmtDate(trip.startDate)} → {fmtDate(trip.endDate)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{trip.description}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {/* view toggle */}
              <div className="flex glass rounded-xl overflow-hidden">
                <button
                  id="itinerary-list-view"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-white/5"}`}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  id="itinerary-calendar-view"
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${viewMode === "calendar" ? "bg-primary text-primary-foreground" : "hover:bg-white/5"}`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Timeline</span>
                </button>
              </div>
              <button
                id="itinerary-edit-toggle"
                onClick={() => setEditMode((v) => !v)}
                className={`px-3 py-2 rounded-xl text-sm flex items-center gap-1.5 transition-colors ${editMode ? "bg-primary text-primary-foreground" : "glass hover:bg-white/5"}`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                {editMode ? "Done" : "Edit"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-border">
            {[
              { label: "Stops", value: trip.stops.length },
              { label: "Activities", value: trip.stops.reduce((s, st) => s + st.activities.length, 0) },
              { label: "Est. Budget", value: fmtCurrency(totalBudget) },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl px-4 py-2.5">
                <div className="text-lg font-bold text-gradient">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── LIST VIEW ──────────────────────────────────────────────── */}
        {viewMode === "list" && (
          <Reorder.Group
            axis="y"
            values={stopOrder}
            onReorder={setStopOrder}
            className="space-y-4"
            as="div"
          >
            {orderedStops.map((stop, idx) => (
              <StopCard
                key={stop.id}
                stop={stop}
                index={idx}
                tripId={tripId}
                editMode={editMode}
                expanded={expandedStops.has(stop.id)}
                onToggle={() => toggleStop(stop.id)}
                onDelete={() => handleDeleteStop(stop.id)}
                onAddActivity={() => setAddActStop(stop.id)}
                addActStop={addActStop}
                actTitle={actTitle}
                setActTitle={setActTitle}
                actTime={actTime}
                setActTime={setActTime}
                actCost={actCost}
                setActCost={setActCost}
                actNotes={actNotes}
                setActNotes={setActNotes}
                onSaveActivity={() => handleAddActivity(stop.id)}
                onCancelActivity={() => setAddActStop(null)}
                fmtCurrency={fmtCurrency}
              />
            ))}
          </Reorder.Group>
        )}

        {/* ── TIMELINE VIEW ──────────────────────────────────────────── */}
        {viewMode === "calendar" && (
          <div className="space-y-8">
            {orderedStops.map((stop, idx) => (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-8"
              >
                {/* timeline line */}
                {idx < orderedStops.length - 1 && (
                  <div className="absolute left-3 top-8 bottom-0 w-px bg-gradient-to-b from-primary/40 to-transparent" />
                )}
                {/* dot */}
                <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-primary-foreground" />
                </div>

                <div className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="font-display text-xl font-semibold">{stop.city}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fmtDate(stop.startDate)} → {fmtDate(stop.endDate)}
                      </p>
                    </div>
                    <span className="text-xs glass px-2.5 py-1 rounded-full">
                      {stop.activities.length} {stop.activities.length === 1 ? "activity" : "activities"}
                    </span>
                  </div>

                  {stop.activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No activities yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {stop.activities.map((act) => (
                        <div key={act.id} className="flex items-start gap-3 bg-white/3 rounded-xl p-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              {act.time && (
                                <span className="text-xs text-primary font-medium flex items-center gap-1">
                                  <Clock className="h-3 w-3" />{act.time}
                                </span>
                              )}
                              <span className="text-sm font-medium">{act.title}</span>
                            </div>
                            {act.notes && <p className="text-xs text-muted-foreground">{act.notes}</p>}
                          </div>
                          {act.cost > 0 && (
                            <span className="text-xs text-neon font-semibold shrink-0">
                              {fmtCurrency(act.cost)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs text-muted-foreground">
                    <span>Stop budget</span>
                    <span className="font-semibold text-foreground">
                      {fmtCurrency(stop.activities.reduce((s, a) => s + a.cost, 0))}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Stop Button */}
        {editMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            {!showAddStop ? (
              <button
                id="add-stop-btn"
                onClick={() => setShowAddStop(true)}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-primary/40 text-primary text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Stop
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 space-y-4"
              >
                <h3 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> New Stop</h3>
                <div className="space-y-1.5">
                  <input
                    id="new-stop-city"
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="City name"
                    className={`w-full bg-input/50 border ${stopErrors.city ? "border-destructive" : "border-border"} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition`}
                  />
                  {stopErrors.city && <p className="text-xs text-destructive">{stopErrors.city}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Start Date</label>
                    <input type="date" value={newStopStart} onChange={(e) => setNewStopStart(e.target.value)}
                      className={`w-full bg-input/50 border ${stopErrors.start ? "border-destructive" : "border-border"} rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`} />
                    {stopErrors.start && <p className="text-xs text-destructive">{stopErrors.start}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">End Date</label>
                    <input type="date" value={newStopEnd} onChange={(e) => setNewStopEnd(e.target.value)}
                      className={`w-full bg-input/50 border ${stopErrors.end ? "border-destructive" : "border-border"} rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`} />
                    {stopErrors.end && <p className="text-xs text-destructive">{stopErrors.end}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    id="save-stop-btn"
                    onClick={handleAddStop}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5 hover:scale-105 transition-transform"
                  >
                    <Check className="h-4 w-4" /> Save Stop
                  </button>
                  <button
                    onClick={() => { setShowAddStop(false); setStopErrors({}); }}
                    className="px-4 py-2.5 rounded-xl glass text-sm hover:bg-white/5 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Stop Card component ────────────────────────────────────────────────────────

function StopCard({
  stop, index, tripId, editMode, expanded, onToggle, onDelete,
  onAddActivity, addActStop, actTitle, setActTitle, actTime, setActTime,
  actCost, setActCost, actNotes, setActNotes, onSaveActivity, onCancelActivity, fmtCurrency,
}: {
  stop: Stop; index: number; tripId: string; editMode: boolean; expanded: boolean;
  onToggle: () => void; onDelete: () => void; onAddActivity: () => void;
  addActStop: string | null; actTitle: string; setActTitle: (v: string) => void;
  actTime: string; setActTime: (v: string) => void; actCost: string; setActCost: (v: string) => void;
  actNotes: string; setActNotes: (v: string) => void; onSaveActivity: () => void;
  onCancelActivity: () => void; fmtCurrency: (n: number) => string;
}) {
  const stopBudget = stop.activities.reduce((s, a) => s + a.cost, 0);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Reorder.Item key={stop.id} value={stop.id} as="div" dragListener={editMode}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        className="glass rounded-2xl overflow-hidden"
      >
        {/* Stop header */}
        <div
          className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/3 transition-colors"
          onClick={onToggle}
        >
          {editMode && (
            <GripVertical className="h-5 w-5 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />
          )}
          <div className="flex-1 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold">{stop.city}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                {fmtDate(stop.startDate)} → {fmtDate(stop.endDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-neon font-semibold hidden sm:block">{fmtCurrency(stopBudget)}</span>
            {editMode && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>

        {/* Activities */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-2 border-t border-border pt-4">
                {stop.activities.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-3">
                    No activities yet — add the first one!
                  </p>
                )}
                {stop.activities.map((act) => (
                  <ActivityRow
                    key={act.id}
                    activity={act}
                    editMode={editMode}
                    onDelete={() => tripStore.deleteActivity(tripId, stop.id, act.id)}
                    fmtCurrency={fmtCurrency}
                  />
                ))}

                {/* Add activity inline form */}
                {addActStop === stop.id ? (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white/3 rounded-xl p-4 space-y-3">
                    <input
                      id={`activity-title-${stop.id}`}
                      type="text"
                      value={actTitle}
                      onChange={(e) => setActTitle(e.target.value)}
                      placeholder="Activity title"
                      className="w-full bg-input/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input type="time" value={actTime} onChange={(e) => setActTime(e.target.value)}
                          className="w-full bg-input/50 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input type="number" value={actCost} onChange={(e) => setActCost(e.target.value)}
                          placeholder="Cost (₹)" min="0"
                          className="w-full bg-input/50 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={actNotes}
                      onChange={(e) => setActNotes(e.target.value)}
                      placeholder="Notes (optional)"
                      className="w-full bg-input/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <div className="flex gap-2">
                      <button id={`save-activity-${stop.id}`} onClick={onSaveActivity}
                        className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors">
                        <Check className="h-3.5 w-3.5" /> Add Activity
                      </button>
                      <button onClick={onCancelActivity}
                        className="px-3 py-2 rounded-lg glass text-xs hover:bg-white/5 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    id={`add-activity-${stop.id}`}
                    onClick={(e) => { e.stopPropagation(); onAddActivity(); }}
                    className="w-full py-2.5 rounded-xl border border-dashed border-border text-muted-foreground text-xs font-medium flex items-center justify-center gap-2 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Activity
                  </button>
                )}

                {/* Stop total */}
                {stop.activities.length > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <span>Stop total</span>
                    <span className="font-semibold text-neon">{fmtCurrency(stopBudget)}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Reorder.Item>
  );
}

function ActivityRow({ activity, editMode, onDelete, fmtCurrency }: {
  activity: Activity; editMode: boolean; onDelete: () => void; fmtCurrency: (n: number) => string;
}) {
  return (
    <div className="flex items-start gap-3 bg-white/3 rounded-xl px-3 py-2.5 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {activity.time && (
            <span className="text-xs text-primary font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />{activity.time}
            </span>
          )}
          <span className="text-sm font-medium truncate">{activity.title}</span>
        </div>
        {activity.notes && <p className="text-xs text-muted-foreground mt-0.5 truncate">{activity.notes}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {activity.cost > 0 && (
          <span className="text-xs text-neon font-semibold">{fmtCurrency(activity.cost)}</span>
        )}
        {editMode && (
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
