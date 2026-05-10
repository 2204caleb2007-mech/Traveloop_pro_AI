export interface TripNote {
  id: string;
  tripId: string;
  title: string;
  content: string;
  city?: string;
  date: string;
  createdAt: string;
}

let notes: TripNote[] = [
  { id: "note-1", tripId: "trip-1", title: "Delhi Tips 📍", content: "Book Red Fort tickets online in advance. The best time to visit Chandni Chowk is early morning. Try Paranthe Wali Gali for authentic stuffed flatbreads. Auto-rickshaws are best for Old Delhi — negotiate the fare first.", city: "Delhi", date: "2026-06-10", createdAt: "2026-05-01T10:00:00Z" },
  { id: "note-2", tripId: "trip-1", title: "Taj Mahal Sunrise", content: "Wake up at 5:30 AM. Bring a tripod. Golden light at sunrise is magical and crowds are minimal. East Gate entry is less crowded than South Gate. Shoes must be removed at the entrance.", city: "Agra", date: "2026-06-14", createdAt: "2026-05-02T08:00:00Z" },
  { id: "note-3", tripId: "trip-1", title: "Jaipur Highlights", content: "The Pink City needs 2-3 days. Amber Palace takes 3 hours minimum. Try dal baati churma at Chokhi Dhani. Johari Bazaar is best for gemstone shopping — always bargain!", city: "Jaipur", date: "2026-06-17", createdAt: "2026-05-03T09:30:00Z" },
  { id: "note-4", tripId: "trip-2", title: "Manali Essentials", content: "Carry warm layers even in summer — nights are cold. Solang Valley is 14km from town. Rohtang Pass permits must be booked 2-3 days in advance.", city: "Manali", date: "2026-03-01", createdAt: "2026-02-15T12:00:00Z" },
];

let listeners: (() => void)[] = [];
function notify() { listeners.forEach((cb) => cb()); }

export const notesStore = {
  getByTrip: (tripId: string) =>
    [...notes.filter((n) => n.tripId === tripId)].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),

  add(note: Omit<TripNote, "id" | "createdAt">) {
    const newNote: TripNote = { ...note, id: `note-${Date.now()}`, createdAt: new Date().toISOString() };
    notes = [newNote, ...notes];
    notify();
    return newNote;
  },

  update(id: string, partial: Partial<Omit<TripNote, "id" | "tripId" | "createdAt">>) {
    notes = notes.map((n) => (n.id === id ? { ...n, ...partial } : n));
    notify();
  },

  delete(id: string) {
    notes = notes.filter((n) => n.id !== id);
    notify();
  },

  search(tripId: string, query: string) {
    const q = query.toLowerCase();
    return notes.filter((n) => n.tripId === tripId && (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || (n.city ?? "").toLowerCase().includes(q)));
  },

  subscribe(cb: () => void) {
    listeners.push(cb);
    return () => { listeners = listeners.filter((l) => l !== cb); };
  },
};
