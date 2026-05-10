// ── CITIES ────────────────────────────────────────────────────────────────────

export interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  costIndex: number; // 1-5 (1=budget, 5=luxury)
  popularityRating: number; // 1-5
  emoji?: string;
  image: string;
  description: string;
  tags: string[];
}

export const CITIES: City[] = [
  { id: "c1", name: "Jaipur", country: "India", region: "South Asia", costIndex: 2, popularityRating: 4.5, image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop", description: "The Pink City — forts, palaces and vibrant bazaars.", tags: ["Heritage", "Culture", "Shopping"] },
  { id: "c2", name: "Goa", country: "India", region: "South Asia", costIndex: 2, popularityRating: 4.7, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop", description: "Sun, sand and Portuguese heritage on India's western coast.", tags: ["Beach", "Nightlife", "Relaxation"] },
  { id: "c3", name: "Varanasi", country: "India", region: "South Asia", costIndex: 1, popularityRating: 4.3, image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop", description: "One of the world's oldest cities on the sacred Ganges.", tags: ["Spiritual", "Culture", "History"] },
  { id: "c4", name: "Paris", country: "France", region: "Europe", costIndex: 5, popularityRating: 4.9, image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop", description: "The City of Light — art, fashion and world-class cuisine.", tags: ["Romance", "Art", "Food"] },
  { id: "c5", name: "Rome", country: "Italy", region: "Europe", costIndex: 4, popularityRating: 4.8, image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop", description: "Eternal city of ancient ruins, piazzas and pasta.", tags: ["History", "Culture", "Food"] },
  { id: "c6", name: "Barcelona", country: "Spain", region: "Europe", costIndex: 3, popularityRating: 4.7, image: "https://images.unsplash.com/photo-1583422409516-15eba534e402?q=80&w=800&auto=format&fit=crop", description: "Gaudí's playground — architecture, tapas and beaches.", tags: ["Architecture", "Beach", "Nightlife"] },
  { id: "c7", name: "Bangkok", country: "Thailand", region: "Southeast Asia", costIndex: 2, popularityRating: 4.6, image: "https://images.unsplash.com/photo-1508009603885-247a597a15ea?q=80&w=800&auto=format&fit=crop", description: "Temples, street food and neon-lit nights.", tags: ["Food", "Culture", "Nightlife"] },
  { id: "c8", name: "Tokyo", country: "Japan", region: "East Asia", costIndex: 4, popularityRating: 4.9, image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=800&auto=format&fit=crop", description: "Where ultra-modern meets ancient tradition.", tags: ["Technology", "Culture", "Food"] },
  { id: "c9", name: "Bali", country: "Indonesia", region: "Southeast Asia", costIndex: 2, popularityRating: 4.7, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop", description: "Island of the Gods — rice terraces, temples and surf.", tags: ["Beach", "Spiritual", "Relaxation"] },
  { id: "c10", name: "Dubai", country: "UAE", region: "Middle East", costIndex: 5, popularityRating: 4.6, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop", description: "Futuristic skyline, luxury malls and desert adventures.", tags: ["Luxury", "Shopping", "Adventure"] },
  { id: "c11", name: "Istanbul", country: "Turkey", region: "Europe/Asia", costIndex: 3, popularityRating: 4.8, image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a088f?q=80&w=800&auto=format&fit=crop", description: "Where East meets West — a city of mosques and bazaars.", tags: ["History", "Culture", "Food"] },
  { id: "c12", name: "New York", country: "USA", region: "North America", costIndex: 5, popularityRating: 4.8, image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop", description: "The Big Apple — museums, Broadway and iconic skyline.", tags: ["Culture", "Art", "Food"] },
  { id: "c13", name: "Kyoto", country: "Japan", region: "East Asia", costIndex: 4, popularityRating: 4.8, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop", description: "Ancient capital of Japan with thousands of shrines.", tags: ["Heritage", "Spiritual", "Culture"] },
  { id: "c14", name: "Cape Town", country: "South Africa", region: "Africa", costIndex: 3, popularityRating: 4.7, image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=800&auto=format&fit=crop", description: "Majestic Table Mountain, vineyards and ocean views.", tags: ["Adventure", "Beach", "Nature"] },
  { id: "c15", name: "Lisbon", country: "Portugal", region: "Europe", costIndex: 3, popularityRating: 4.6, image: "https://images.unsplash.com/photo-1538332576228-eb5b4c4de3f5?q=80&w=800&auto=format&fit=crop", description: "A city of seven hills, Lisbon captivates with its sun-drenched yellow trams, historic Alfama district, and the melancholic beauty of Fado music. From the intricate azulejo tiles of its buildings to the sweeping views of the Atlantic, it's a place where history meets modern creativity.", tags: ["Culture", "Food", "History"] },
  { id: "c16", name: "Maldives", country: "Maldives", region: "South Asia", costIndex: 5, popularityRating: 4.9, image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop", description: "A tropical paradise of 26 coral atolls, the Maldives is synonymous with turquoise lagoons, powdery white sand, and luxurious overwater bungalows. It's the ultimate destination for snorkeling, diving among vibrant reefs, and experiencing serene seclusion amidst the Indian Ocean.", tags: ["Luxury", "Beach", "Relaxation"] },
  { id: "c17", name: "Kolkata", country: "India", region: "South Asia", costIndex: 1, popularityRating: 4.2, image: "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop", description: "Formerly known as Calcutta, the 'City of Joy' is India's intellectual and cultural hub. It's a city of grand colonial architecture, legendary street food like kathi rolls and puchkas, and a deep-rooted passion for art, literature, and the iconic yellow taxis roaming its storied streets.", tags: ["Culture", "Food", "History"] },
  { id: "c18", name: "Queenstown", country: "New Zealand", region: "Oceania", costIndex: 4, popularityRating: 4.7, image: "https://images.unsplash.com/photo-1607567702206-8c9502ab84a8?q=80&w=800&auto=format&fit=crop", description: "Adventure capital — bungee, skiing and fjords.", tags: ["Adventure", "Nature", "Sports"] },
];

// ── ACTIVITIES ─────────────────────────────────────────────────────────────────

export type ActivityCategory = "Sightseeing" | "Food & Dining" | "Adventure" | "Culture" | "Nightlife" | "Relaxation";

export interface ActivityItem {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  estimatedCost: number;
  duration: string;
  rating: number;
  city: string;
  emoji?: string;
  image: string;
}

export const ACTIVITIES: ActivityItem[] = [
  { id: "act-1", name: "Taj Mahal Tour", description: "UNESCO World Heritage Site — one of the Seven Wonders of the World.", category: "Sightseeing", estimatedCost: 1100, duration: "3-4 hrs", rating: 4.9, city: "Agra", image: "https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?q=80&w=1106&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: "act-2", name: "Amber Palace Visit", description: "Magnificent hilltop fort with stunning mirror work and gardens.", category: "Sightseeing", estimatedCost: 800, duration: "3 hrs", rating: 4.7, city: "Jaipur", image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800&auto=format&fit=crop" },
  { id: "act-3", name: "Ganges Aarti Ceremony", description: "Ancient evening prayer ceremony on the ghats at sunset.", category: "Culture", estimatedCost: 0, duration: "1.5 hrs", rating: 4.8, city: "Varanasi", image: "https://images.unsplash.com/photo-1665413793441-13aedeb062d3?q=80&w=658&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: "act-4", name: "Old Delhi Street Food Walk", description: "Explore legendary Paranthe Wali Gali, chaat and jalebis.", category: "Food & Dining", estimatedCost: 600, duration: "2 hrs", rating: 4.8, city: "Delhi", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop" },
  { id: "act-5", name: "Eiffel Tower Sunset Visit", description: "Iconic Paris landmark — best at sunset with city views.", category: "Sightseeing", estimatedCost: 2800, duration: "2 hrs", rating: 4.9, city: "Paris", image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80&w=800&auto=format&fit=crop" },
  { id: "act-6", name: "Louvre Museum Tour", description: "World's largest art museum — home to the Mona Lisa.", category: "Culture", estimatedCost: 1500, duration: "Half day", rating: 4.8, city: "Paris", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop" },
  { id: "act-7", name: "Colosseum & Forum", description: "Ancient Roman amphitheatre and the heart of the Roman Empire.", category: "Sightseeing", estimatedCost: 2200, duration: "3 hrs", rating: 4.9, city: "Rome", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop" },
  { id: "act-8", name: "Sagrada Família Tour", description: "Gaudí's breathtaking unfinished basilica — a masterpiece.", category: "Culture", estimatedCost: 2600, duration: "2 hrs", rating: 4.8, city: "Barcelona", image: "https://images.unsplash.com/photo-1728249987965-3943d53dd634?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: "act-9", name: "Floating Market Boat Tour", description: "Explore Bangkok's vibrant floating markets by longtail boat.", category: "Sightseeing", estimatedCost: 700, duration: "2 hrs", rating: 4.5, city: "Bangkok", image: "https://images.unsplash.com/photo-1590119227988-a20d53ce33c0?q=80&w=1315&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: "act-10", name: "Tokyo Ramen Bar Crawl", description: "Discover authentic ramen spots across the city's neighborhoods.", category: "Food & Dining", estimatedCost: 1800, duration: "3 hrs", rating: 4.8, city: "Tokyo", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800&auto=format&fit=crop" },
  { id: "act-11", name: "Ubud Rice Terrace Walk", description: "Trek through lush green Tegallalang terraces at sunrise.", category: "Adventure", estimatedCost: 400, duration: "3 hrs", rating: 4.7, city: "Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop" },
  { id: "act-12", name: "Dubai Desert Safari", description: "Dune bashing, camel riding and BBQ dinner under stars.", category: "Adventure", estimatedCost: 4500, duration: "6 hrs", rating: 4.8, city: "Dubai", image: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?q=80&w=800&auto=format&fit=crop" },
  { id: "act-13", name: "Bosphorus Sunset Cruise", description: "Scenic boat cruise between Europe and Asia along the strait.", category: "Relaxation", estimatedCost: 1200, duration: "2 hrs", rating: 4.7, city: "Istanbul", image: "https://images.unsplash.com/photo-1655582484388-60ce7623942c?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: "act-14", name: "MoMA Art Museum", description: "Modern and contemporary art including Van Gogh's Starry Night.", category: "Culture", estimatedCost: 2800, duration: "3 hrs", rating: 4.7, city: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop" },
  { id: "act-15", name: "Fushimi Inari Shrine", description: "Walk through thousands of vermilion torii gates up the mountain.", category: "Sightseeing", estimatedCost: 0, duration: "3 hrs", rating: 4.9, city: "Kyoto", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop" },
  { id: "act-16", name: "Table Mountain Hike", description: "Summit the iconic flat-topped mountain for panoramic views.", category: "Adventure", estimatedCost: 800, duration: "4 hrs", rating: 4.8, city: "Cape Town", image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=800&auto=format&fit=crop" },
  { id: "act-18", name: "Snorkelling in Maldives", description: "Explore vivid coral reefs with sea turtles and reef sharks.", category: "Adventure", estimatedCost: 3500, duration: "2 hrs", rating: 4.9, city: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop" },
  { id: "act-19", name: "Holi Festival Experience", description: "Join the world-famous color festival celebration.", category: "Culture", estimatedCost: 500, duration: "Full day", rating: 4.9, city: "Jaipur", image: "https://images.unsplash.com/photo-1772554699679-edde1037c125?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: "act-20", name: "Bungee Jump Queenstown", description: "World-famous Kawarau Bridge bungee — the original!", category: "Adventure", estimatedCost: 12000, duration: "2 hrs", rating: 4.9, city: "Queenstown", image: "https://images.unsplash.com/photo-1756114940237-011377b7446d?q=80&w=694&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: "act-21", name: "Tapas Bar Hopping", description: "Explore Barcelona's best pintxos and tapas bars in El Born.", category: "Nightlife", estimatedCost: 2000, duration: "3 hrs", rating: 4.6, city: "Barcelona", image: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?q=80&w=800&auto=format&fit=crop" },
  { id: "act-22", name: "Kerala Cooking Class", description: "Learn to cook traditional Kerala fish curry and appam.", category: "Food & Dining", estimatedCost: 1200, duration: "3 hrs", rating: 4.7, city: "Kochi", image: "https://images.unsplash.com/photo-1620894592665-c68bdefed3fd?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
];

// ── PROFILE ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  email: string;
  photo?: string;
  language: string;
  notificationsEnabled: boolean;
  savedDestinations: string[];
  travelStyle: string[];
}

let profile: UserProfile = {
  name: "Explorer",
  email: "user@example.com",
  language: "English",
  notificationsEnabled: true,
  savedDestinations: ["Paris, France", "Bali, Indonesia", "Tokyo, Japan"],
  travelStyle: ["Adventure", "Culture"],
};

let profileListeners: (() => void)[] = [];

export const profileStore = {
  get: () => profile,
  update(partial: Partial<UserProfile>) {
    profile = { ...profile, ...partial };
    profileListeners.forEach((cb) => cb());
  },
  subscribe(cb: () => void) {
    profileListeners.push(cb);
    return () => { profileListeners = profileListeners.filter((l) => l !== cb); };
  },
};

// ── BUDGET ────────────────────────────────────────────────────────────────────

export type BudgetCategory = "Transportation" | "Accommodation" | "Activities" | "Meals" | "Miscellaneous";

export interface BudgetEntry {
  id: string;
  tripId: string;
  category: BudgetCategory;
  description: string;
  amount: number;
  date: string;
}

let budgetEntries: BudgetEntry[] = [
  { id: "b1", tripId: "trip-1", category: "Transportation", description: "Delhi–Agra train tickets (x2)", amount: 1800, date: "2026-06-13" },
  { id: "b2", tripId: "trip-1", category: "Transportation", description: "Agra–Jaipur bus", amount: 1200, date: "2026-06-16" },
  { id: "b3", tripId: "trip-1", category: "Accommodation", description: "Hotel in Delhi (3 nights)", amount: 7500, date: "2026-06-10" },
  { id: "b4", tripId: "trip-1", category: "Accommodation", description: "Agra guesthouse (2 nights)", amount: 4000, date: "2026-06-14" },
  { id: "b5", tripId: "trip-1", category: "Accommodation", description: "Jaipur heritage hotel (5 nights)", amount: 15000, date: "2026-06-17" },
  { id: "b6", tripId: "trip-1", category: "Meals", description: "Daily food budget (12 days)", amount: 12000, date: "2026-06-10" },
  { id: "b7", tripId: "trip-1", category: "Miscellaneous", description: "Shopping & souvenirs", amount: 5000, date: "2026-06-20" },
  { id: "b8", tripId: "trip-2", category: "Transportation", description: "Flight to Manali", amount: 8500, date: "2026-03-01" },
  { id: "b9", tripId: "trip-2", category: "Accommodation", description: "Mountain lodge (7 nights)", amount: 14000, date: "2026-03-01" },
];

let budgetListeners: (() => void)[] = [];

export const budgetStore = {
  getByTrip: (tripId: string) => budgetEntries.filter((b) => b.tripId === tripId),
  getLimit: (tripId: string) => budgetLimits[tripId] ?? null,

  add(entry: Omit<BudgetEntry, "id">) {
    const newEntry: BudgetEntry = { ...entry, id: `b-${Date.now()}` };
    budgetEntries = [...budgetEntries, newEntry];
    budgetListeners.forEach((cb) => cb());
    return newEntry;
  },

  delete(id: string) {
    budgetEntries = budgetEntries.filter((b) => b.id !== id);
    budgetListeners.forEach((cb) => cb());
  },

  setLimit(tripId: string, limit: number) {
    budgetLimits[tripId] = limit;
    budgetListeners.forEach((cb) => cb());
  },

  subscribe(cb: () => void) {
    budgetListeners.push(cb);
    return () => { budgetListeners = budgetListeners.filter((l) => l !== cb); };
  },
};

const budgetLimits: Record<string, number> = { "trip-1": 60000 };
