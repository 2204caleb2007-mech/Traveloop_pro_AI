import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Search, Edit3, Check, X, MapPin, Calendar, BookOpen } from "lucide-react";
import { useState, useMemo } from "react";
import { useNotes, useTrip } from "@/hooks/useTrips";
import { notesStore } from "@/lib/notesStore";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/trips/$tripId/journal")({
  head: () => ({ meta: [{ title: "Trip Journal — GlobeX AI" }] }),
  component: JournalPage,
});

function JournalPage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const trip = useTrip(tripId);
  const notes = useNotes(tripId);

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);

  const cities = ["All", ...Array.from(new Set(notes.map(n => n.city).filter(Boolean) as string[]))];

  const filtered = useMemo(() => {
    let list = notes;
    if (search) { const q = search.toLowerCase(); list = list.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || (n.city ?? "").toLowerCase().includes(q)); }
    if (cityFilter !== "All") list = list.filter(n => n.city === cityFilter);
    return list;
  }, [notes, search, cityFilter]);

  function resetForm() { setFormTitle(""); setFormContent(""); setFormCity(""); setFormDate(new Date().toISOString().split("T")[0]); }

  function handleSave() {
    if (!formTitle.trim() || !formContent.trim()) return;
    if (editId) {
      notesStore.update(editId, { title: formTitle.trim(), content: formContent.trim(), city: formCity || undefined, date: formDate });
      setEditId(null);
    } else {
      notesStore.add({ tripId, title: formTitle.trim(), content: formContent.trim(), city: formCity || undefined, date: formDate });
      setShowAdd(false);
    }
    resetForm();
  }

  function startEdit(note: typeof notes[0]) {
    setEditId(note.id);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormCity(note.city ?? "");
    setFormDate(note.date);
    setShowAdd(false);
  }

  function cancelEdit() { setEditId(null); resetForm(); }

  const stopCities = trip?.stops.map(s => s.city) ?? [];
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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

          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-0.5 flex items-center gap-2">
                <BookOpen className="h-7 w-7 text-primary" />Journal
              </h1>
              <p className="text-muted-foreground text-sm">{trip.name}</p>
            </div>
            <button id="add-note-btn" onClick={() => { setShowAdd(v => !v); setEditId(null); resetForm(); }}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:scale-105 transition-transform flex items-center gap-1.5">
              <Plus className="h-4 w-4" />Add Note
            </button>
          </div>

          {/* Add / Edit form */}
          <AnimatePresence>
            {(showAdd || editId) && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="glass rounded-2xl p-5 mb-6 space-y-3">
                <h3 className="font-semibold text-sm">{editId ? "Edit Note" : "New Note"}</h3>
                <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Note title"
                  className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <textarea value={formContent} onChange={e => setFormContent(e.target.value)} placeholder="Write your note, tips, reminders..." rows={4}
                  className="w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">City (optional)</label>
                    <select value={formCity} onChange={e => setFormCity(e.target.value)}
                      className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">No specific city</option>
                      {stopCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                    <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                      className="w-full bg-input/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button id="save-note-btn" onClick={handleSave}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5 hover:scale-105 transition-transform">
                    <Check className="h-4 w-4" />{editId ? "Save Changes" : "Add Note"}
                  </button>
                  <button onClick={() => { setShowAdd(false); cancelEdit(); }} className="px-4 py-2.5 rounded-xl glass text-sm hover:bg-white/5">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input id="note-search" type="text" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition" />
          </div>

          {/* City filter */}
          {cities.length > 1 && (
            <div className="flex gap-2 flex-wrap mb-6">
              {cities.map(c => (
                <button key={c} onClick={() => setCityFilter(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cityFilter === c ? "bg-primary text-primary-foreground" : "glass hover:bg-white/5"}`}>
                  {c !== "All" && <span className="mr-1">📍</span>}{c}
                </button>
              ))}
            </div>
          )}

          {/* Notes list */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">{search ? "No notes match your search." : "No notes yet. Start journaling your trip!"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((note, i) => (
                <motion.div key={note.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className={`glass rounded-2xl p-5 group hover:border-primary/20 transition-colors ${editId === note.id ? "border-primary/40" : ""}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-display font-semibold">{note.title}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button id={`edit-note-${note.id}`} onClick={() => startEdit(note)}
                        className="p-1.5 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button id={`delete-note-${note.id}`} onClick={() => notesStore.delete(note.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    {note.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{note.city}</span>}
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(note.date)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{note.content}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
