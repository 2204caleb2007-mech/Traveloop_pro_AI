export type PackingCategory =
  | "Documents"
  | "Clothing"
  | "Electronics"
  | "Toiletries"
  | "Accessories"
  | "Other";

export interface PackingItem {
  id: string;
  tripId: string;
  label: string;
  category: PackingCategory;
  packed: boolean;
  priority: boolean;
}

export const CATEGORY_TEMPLATES: Record<PackingCategory, string[]> = {
  Documents: [
    "Passport",
    "Flight Tickets (printed)",
    "Travel Insurance",
    "Hotel Booking Confirmation",
    "Visa Documents",
    "Emergency Contacts",
  ],
  Clothing: [
    "Casual Shirts",
    "Trousers / Jeans",
    "Comfortable Walking Shoes",
    "Light Jacket / Windbreaker",
    "Swimwear",
    "Undergarments",
    "Formal Outfit",
  ],
  Electronics: [
    "Phone Charger",
    "Universal Power Adapter",
    "Earphones / Headphones",
    "Camera",
    "Power Bank",
    "Laptop / Tablet",
  ],
  Toiletries: [
    "Toothbrush & Toothpaste",
    "Shampoo & Conditioner",
    "Sunscreen SPF50+",
    "Moisturizer",
    "Deodorant",
    "Medicines / First-Aid",
  ],
  Accessories: [
    "Sunglasses",
    "Hat / Cap",
    "Travel Pillow",
    "Umbrella",
    "Reusable Water Bottle",
    "Day Backpack",
  ],
  Other: [],
};

let packingItems: PackingItem[] = [
  { id: "p1", tripId: "trip-1", label: "Passport", category: "Documents", packed: true, priority: true },
  { id: "p2", tripId: "trip-1", label: "Flight Tickets (printed)", category: "Documents", packed: true, priority: true },
  { id: "p3", tripId: "trip-1", label: "Travel Insurance", category: "Documents", packed: true, priority: true },
  { id: "p4", tripId: "trip-1", label: "Hotel Booking Confirmation", category: "Documents", packed: false, priority: true },
  { id: "p5", tripId: "trip-1", label: "Casual Shirts", category: "Clothing", packed: true, priority: false },
  { id: "p6", tripId: "trip-1", label: "Trousers / Jeans", category: "Clothing", packed: false, priority: false },
  { id: "p7", tripId: "trip-1", label: "Comfortable Walking Shoes", category: "Clothing", packed: false, priority: false },
  { id: "p8", tripId: "trip-1", label: "Light Jacket / Windbreaker", category: "Clothing", packed: false, priority: false },
  { id: "p9", tripId: "trip-1", label: "Phone Charger", category: "Electronics", packed: true, priority: true },
  { id: "p10", tripId: "trip-1", label: "Universal Power Adapter", category: "Electronics", packed: false, priority: false },
  { id: "p11", tripId: "trip-1", label: "Earphones / Headphones", category: "Electronics", packed: false, priority: false },
  { id: "p12", tripId: "trip-1", label: "Sunscreen SPF50+", category: "Toiletries", packed: false, priority: true },
  { id: "p13", tripId: "trip-1", label: "Sunglasses", category: "Accessories", packed: false, priority: false },
  { id: "p14", tripId: "trip-1", label: "Reusable Water Bottle", category: "Accessories", packed: false, priority: false },
];

let listeners: (() => void)[] = [];
function notify() { listeners.forEach((cb) => cb()); }

export const packingStore = {
  getByTrip: (tripId: string) => packingItems.filter((p) => p.tripId === tripId),

  add(item: Omit<PackingItem, "id">) {
    const newItem: PackingItem = { ...item, id: `pack-${Date.now()}-${Math.random().toString(36).slice(2)}` };
    packingItems = [...packingItems, newItem];
    notify();
    return newItem;
  },

  toggle(id: string) {
    packingItems = packingItems.map((p) => (p.id === id ? { ...p, packed: !p.packed } : p));
    notify();
  },

  togglePriority(id: string) {
    packingItems = packingItems.map((p) => (p.id === id ? { ...p, priority: !p.priority } : p));
    notify();
  },

  update(id: string, partial: Partial<PackingItem>) {
    packingItems = packingItems.map((p) => (p.id === id ? { ...p, ...partial } : p));
    notify();
  },

  delete(id: string) {
    packingItems = packingItems.filter((p) => p.id !== id);
    notify();
  },

  resetAll(tripId: string) {
    packingItems = packingItems.map((p) => (p.tripId === tripId ? { ...p, packed: false } : p));
    notify();
  },

  applyTemplate(tripId: string) {
    const existing = packingItems.filter((p) => p.tripId === tripId).map((p) => p.label.toLowerCase());
    const newItems: PackingItem[] = [];
    for (const [cat, items] of Object.entries(CATEGORY_TEMPLATES) as [PackingCategory, string[]][]) {
      for (const label of items) {
        if (!existing.includes(label.toLowerCase())) {
          newItems.push({
            id: `pack-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            tripId,
            label,
            category: cat,
            packed: false,
            priority: false,
          });
        }
      }
    }
    packingItems = [...packingItems, ...newItems];
    notify();
  },

  subscribe(cb: () => void) {
    listeners.push(cb);
    return () => { listeners = listeners.filter((l) => l !== cb); };
  },
};
