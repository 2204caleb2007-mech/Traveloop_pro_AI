// Shared in-memory store for trips and auth (no backend)

export interface Activity {
  id: string;
  time: string;
  title: string;
  cost: number;
  notes?: string;
}

export interface Stop {
  id: string;
  city: string;
  startDate: string;
  endDate: string;
  activities: Activity[];
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  coverPhoto?: string;
  stops: Stop[];
  status: "upcoming" | "ongoing" | "completed";
}

export interface User {
  email: string;
  name: string;
}

// ── singleton state ────────────────────────────────────────────────────────────

let currentUser: User | null = null;
let onAuthChange: (() => void) | null = null;

export const auth = {
  getUser: () => currentUser,
  login(email: string, _password: string) {
    if (email === "ADMIN" && _password === "abcdefgh") {
      currentUser = { email: "admin@globex.ai", name: "Admin" };
    } else {
      currentUser = { email, name: email.split("@")[0] };
    }
    onAuthChange?.();
  },
  signup(email: string, _password: string) {
    currentUser = { email, name: email.split("@")[0] };
    onAuthChange?.();
  },
  logout() {
    currentUser = null;
    onAuthChange?.();
  },
  subscribe(cb: () => void) {
    onAuthChange = cb;
    return () => { onAuthChange = null; };
  },
};

// ── mock trips ─────────────────────────────────────────────────────────────────

const mockTrips: Trip[] = [
  {
    id: "trip-1",
    name: "Golden Triangle India",
    startDate: "2026-06-10",
    endDate: "2026-06-22",
    description: "Explore Delhi, Agra and Jaipur in one epic journey.",
    status: "upcoming",
    stops: [
      {
        id: "stop-1",
        city: "Delhi",
        startDate: "2026-06-10",
        endDate: "2026-06-13",
        activities: [
          { id: "a1", time: "09:00", title: "Red Fort visit", cost: 500, notes: "Entry ticket included" },
          { id: "a2", time: "14:00", title: "Chandni Chowk street food", cost: 300 },
        ],
      },
      {
        id: "stop-2",
        city: "Agra",
        startDate: "2026-06-14",
        endDate: "2026-06-16",
        activities: [
          { id: "a3", time: "07:00", title: "Taj Mahal sunrise", cost: 1100 },
          { id: "a4", time: "15:00", title: "Agra Fort", cost: 650 },
        ],
      },
      {
        id: "stop-3",
        city: "Jaipur",
        startDate: "2026-06-17",
        endDate: "2026-06-22",
        activities: [
          { id: "a5", time: "10:00", title: "Amber Palace", cost: 800 },
          { id: "a6", time: "17:00", title: "Hawa Mahal walk", cost: 200 },
        ],
      },
    ],
  },
  {
    id: "trip-2",
    name: "Himalayan Retreat",
    startDate: "2026-03-01",
    endDate: "2026-03-14",
    description: "Trekking through Manali and Leh Ladakh.",
    status: "completed",
    stops: [
      {
        id: "stop-4",
        city: "Manali",
        startDate: "2026-03-01",
        endDate: "2026-03-07",
        activities: [
          { id: "a7", time: "08:00", title: "Solang Valley Snow activities", cost: 1500 },
        ],
      },
    ],
  },
  {
    id: "trip-3",
    name: "Kerala Backwaters",
    startDate: "2026-05-05",
    endDate: "2026-05-12",
    description: "Houseboat cruise through the serene backwaters of Alleppey.",
    status: "ongoing",
    stops: [
      {
        id: "stop-5",
        city: "Kochi",
        startDate: "2026-05-05",
        endDate: "2026-05-07",
        activities: [
          { id: "a8", time: "11:00", title: "Fort Kochi walk", cost: 0 },
        ],
      },
      {
        id: "stop-6",
        city: "Alleppey",
        startDate: "2026-05-08",
        endDate: "2026-05-12",
        activities: [
          { id: "a9", time: "09:00", title: "Houseboat cruise", cost: 6000 },
        ],
      },
    ],
  },
];

let trips: Trip[] = [...mockTrips];
let tripListeners: (() => void)[] = [];

export const tripStore = {
  getAll: () => trips,
  getById: (id: string) => trips.find((t) => t.id === id) ?? null,

  add(trip: Omit<Trip, "id" | "stops" | "status">) {
    const newTrip: Trip = {
      ...trip,
      id: `trip-${Date.now()}`,
      stops: [],
      status: "upcoming",
    };
    trips = [newTrip, ...trips];
    tripListeners.forEach((cb) => cb());
    return newTrip;
  },

  update(id: string, partial: Partial<Trip>) {
    trips = trips.map((t) => (t.id === id ? { ...t, ...partial } : t));
    tripListeners.forEach((cb) => cb());
  },

  delete(id: string) {
    trips = trips.filter((t) => t.id !== id);
    tripListeners.forEach((cb) => cb());
  },

  addStop(tripId: string, stop: Omit<Stop, "id" | "activities">) {
    const newStop: Stop = { ...stop, id: `stop-${Date.now()}`, activities: [] };
    trips = trips.map((t) =>
      t.id === tripId ? { ...t, stops: [...t.stops, newStop] } : t
    );
    tripListeners.forEach((cb) => cb());
    return newStop;
  },

  updateStop(tripId: string, stopId: string, partial: Partial<Stop>) {
    trips = trips.map((t) =>
      t.id === tripId
        ? { ...t, stops: t.stops.map((s) => (s.id === stopId ? { ...s, ...partial } : s)) }
        : t
    );
    tripListeners.forEach((cb) => cb());
  },

  deleteStop(tripId: string, stopId: string) {
    trips = trips.map((t) =>
      t.id === tripId ? { ...t, stops: t.stops.filter((s) => s.id !== stopId) } : t
    );
    tripListeners.forEach((cb) => cb());
  },

  addActivity(tripId: string, stopId: string, activity: Omit<Activity, "id">) {
    const newAct: Activity = { ...activity, id: `act-${Date.now()}` };
    trips = trips.map((t) =>
      t.id === tripId
        ? {
            ...t,
            stops: t.stops.map((s) =>
              s.id === stopId ? { ...s, activities: [...s.activities, newAct] } : s
            ),
          }
        : t
    );
    tripListeners.forEach((cb) => cb());
    return newAct;
  },

  deleteActivity(tripId: string, stopId: string, actId: string) {
    trips = trips.map((t) =>
      t.id === tripId
        ? {
            ...t,
            stops: t.stops.map((s) =>
              s.id === stopId ? { ...s, activities: s.activities.filter((a) => a.id !== actId) } : s
            ),
          }
        : t
    );
    tripListeners.forEach((cb) => cb());
  },

  subscribe(cb: () => void) {
    tripListeners.push(cb);
    return () => { tripListeners = tripListeners.filter((l) => l !== cb); };
  },
};
