export type Country = {
  code: string;
  name: string;
  emoji: string;
  lat: number;
  lon: number;
  blurb: string;
  highlights: string[];
  hiddenGems: string[];
  food: string[];
  suggestedDays: string;
  estBudget: string;
  category: ("beach" | "mountain" | "historical" | "budget" | "luxury" | "hidden")[];
  imageUrl: string;
};

export const COUNTRIES: Country[] = [
  {
    code: "JP",
    name: "Japan",
    emoji: "🇯🇵",
    lat: 35.68,
    lon: 139.69,
    blurb:
      "Neon cities, ancient shrines, bullet trains, and cherry blossoms — Japan is contrast distilled.",
    highlights: ["Tokyo", "Kyoto", "Osaka", "Mt. Fuji", "Nara"],
    hiddenGems: ["Naoshima art island", "Kanazawa", "Yakushima forest"],
    food: ["Sushi", "Ramen", "Okonomiyaki", "Wagyu"],
    suggestedDays: "7–10 days",
    estBudget: "$1,800 – $3,500 / person",
    category: ["historical", "luxury", "hidden"],
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
  },
  {
    code: "FR",
    name: "France",
    emoji: "🇫🇷",
    lat: 48.85,
    lon: 2.35,
    blurb:
      "Paris café terraces, Provence lavender, Alpine peaks, and the Riviera. Romance with a baguette.",
    highlights: ["Paris", "Nice", "Provence", "Mont Saint-Michel"],
    hiddenGems: ["Annecy", "Étretat cliffs", "Colmar"],
    food: ["Croissants", "Coq au vin", "Bouillabaisse", "Crêpes"],
    suggestedDays: "8–12 days",
    estBudget: "$2,000 – $4,000 / person",
    category: ["historical", "luxury"],
    imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop",
  },
  {
    code: "US",
    name: "United States",
    emoji: "🇺🇸",
    lat: 38.9,
    lon: -77.04,
    blurb:
      "Fifty states of contrast — Manhattan skylines to Yosemite granite, Route 66 to Florida keys.",
    highlights: ["NYC", "Grand Canyon", "Yosemite", "New Orleans"],
    hiddenGems: ["Marfa, TX", "Olympic Peninsula", "Asheville"],
    food: ["BBQ", "Lobster roll", "Tacos", "Diner pancakes"],
    suggestedDays: "10–14 days",
    estBudget: "$2,500 – $5,000 / person",
    category: ["mountain", "luxury", "historical"],
    imageUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=800&auto=format&fit=crop",
  },
  {
    code: "IN",
    name: "India",
    emoji: "🇮🇳",
    lat: 28.61,
    lon: 77.21,
    blurb:
      "Himalayas in the north, beaches in the south, deserts in the west, and 1.4 billion stories.",
    highlights: ["Taj Mahal", "Goa", "Jaipur", "Kerala backwaters"],
    hiddenGems: ["Spiti Valley", "Hampi ruins", "Majuli island"],
    food: ["Biryani", "Dosa", "Butter chicken", "Street chaat"],
    suggestedDays: "10–15 days",
    estBudget: "$700 – $2,500 / person",
    category: ["historical", "budget", "beach", "mountain", "hidden"],
    imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800&auto=format&fit=crop",
  },
  {
    code: "CH",
    name: "Switzerland",
    emoji: "🇨🇭",
    lat: 46.95,
    lon: 7.45,
    blurb:
      "Postcard Alps, glassy lakes, chocolate, and the world's most efficient trains.",
    highlights: ["Zermatt", "Lucerne", "Interlaken", "Zürich"],
    hiddenGems: ["Lauterbrunnen", "Aletsch glacier", "Appenzell"],
    food: ["Fondue", "Raclette", "Rösti", "Chocolate"],
    suggestedDays: "6–9 days",
    estBudget: "$3,000 – $5,500 / person",
    category: ["mountain", "luxury"],
    imageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop",
  },
  {
    code: "IT",
    name: "Italy",
    emoji: "🇮🇹",
    lat: 41.9,
    lon: 12.49,
    blurb: "Renaissance art, Roman ruins, Tuscan hills, and pasta worth flying for.",
    highlights: ["Rome", "Florence", "Venice", "Amalfi Coast"],
    hiddenGems: ["Matera", "Cinque Terre", "Procida island"],
    food: ["Pasta carbonara", "Pizza napoletana", "Gelato", "Tiramisu"],
    suggestedDays: "8–12 days",
    estBudget: "$1,800 – $3,800 / person",
    category: ["historical", "luxury", "beach"],
    imageUrl: "https://images.unsplash.com/photo-1516483638261-f40af5bf2216?q=80&w=800&auto=format&fit=crop",
  },
  {
    code: "TH",
    name: "Thailand",
    emoji: "🇹🇭",
    lat: 13.75,
    lon: 100.5,
    blurb: "Gilded temples, white-sand islands, street food temples, and warm hospitality.",
    highlights: ["Bangkok", "Chiang Mai", "Phuket", "Krabi"],
    hiddenGems: ["Koh Lipe", "Pai", "Sukhothai ruins"],
    food: ["Pad thai", "Tom yum", "Mango sticky rice", "Som tam"],
    suggestedDays: "8–12 days",
    estBudget: "$900 – $2,200 / person",
    category: ["beach", "budget", "historical"],
    imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop",
  },
  {
    code: "AE",
    name: "UAE",
    emoji: "🇦🇪",
    lat: 25.2,
    lon: 55.27,
    blurb: "Skyscrapers in the desert, gold souks, and luxury redefined.",
    highlights: ["Dubai", "Abu Dhabi", "Burj Khalifa", "Desert safari"],
    hiddenGems: ["Hatta mountains", "Al Ain oasis", "Liwa dunes"],
    food: ["Shawarma", "Mandi", "Luqaimat", "Karak chai"],
    suggestedDays: "5–7 days",
    estBudget: "$2,000 – $5,000 / person",
    category: ["luxury"],
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop",
  },
  {
    code: "BR",
    name: "Brazil",
    emoji: "🇧🇷",
    lat: -22.91,
    lon: -43.17,
    blurb: "Amazon rainforest, Carnival rhythms, and beaches that go on for miles.",
    highlights: ["Rio", "Iguazu Falls", "Salvador", "Amazon"],
    hiddenGems: ["Lençóis Maranhenses", "Fernando de Noronha", "Ouro Preto"],
    food: ["Feijoada", "Açaí", "Pão de queijo", "Picanha"],
    suggestedDays: "10–14 days",
    estBudget: "$1,500 – $3,500 / person",
    category: ["beach", "hidden"],
    imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800&auto=format&fit=crop",
  },
  {
    code: "AU",
    name: "Australia",
    emoji: "🇦🇺",
    lat: -33.87,
    lon: 151.21,
    blurb: "Reef, Outback, and a coffee culture that rivals Italy.",
    highlights: ["Sydney", "Great Barrier Reef", "Uluru", "Melbourne"],
    hiddenGems: ["Lord Howe Island", "Kangaroo Island", "Margaret River"],
    food: ["Meat pie", "Lamingtons", "Flat white", "Barramundi"],
    suggestedDays: "10–14 days",
    estBudget: "$2,500 – $5,500 / person",
    category: ["beach", "luxury"],
    imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800&auto=format&fit=crop",
  },
  {
    code: "EG",
    name: "Egypt",
    emoji: "🇪🇬",
    lat: 30.04,
    lon: 31.23,
    blurb: "5,000 years of pharaohs, the Nile, and the Red Sea's reefs.",
    highlights: ["Pyramids of Giza", "Luxor", "Aswan", "Sharm El Sheikh"],
    hiddenGems: ["Siwa oasis", "White Desert", "Dahab"],
    food: ["Koshari", "Ful medames", "Molokhia", "Baklava"],
    suggestedDays: "7–10 days",
    estBudget: "$1,200 – $2,500 / person",
    category: ["historical", "budget", "beach"],
    imageUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=800&auto=format&fit=crop",
  },
  {
    code: "IS",
    name: "Iceland",
    emoji: "🇮🇸",
    lat: 64.13,
    lon: -21.9,
    blurb: "Glaciers, volcanoes, geysers, and the northern lights.",
    highlights: ["Reykjavík", "Golden Circle", "Blue Lagoon", "Vík"],
    hiddenGems: ["Westfjords", "Landmannalaugar", "Hornstrandir"],
    food: ["Skyr", "Lamb soup", "Hot dogs", "Rye bread"],
    suggestedDays: "6–9 days",
    estBudget: "$2,500 – $4,500 / person",
    category: ["mountain", "hidden", "luxury"],
    imageUrl: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=800&auto=format&fit=crop",
  },
];

export const getCountry = (code: string) =>
  COUNTRIES.find((c) => c.code.toLowerCase() === code.toLowerCase());

export const CATEGORIES = [
  { id: "beach", label: "Beaches", emoji: "🏖️" },
  { id: "mountain", label: "Mountains", emoji: "🏔️" },
  { id: "historical", label: "Historical", emoji: "🏛️" },
  { id: "budget", label: "Budget Friendly", emoji: "💸" },
  { id: "luxury", label: "Luxury", emoji: "✨" },
  { id: "hidden", label: "Hidden Gems", emoji: "💎" },
] as const;

export async function fetchAllCountries(): Promise<Country[]> {
  if (typeof window === "undefined") return COUNTRIES;
  
  const cached = sessionStorage.getItem("all_countries");
  if (cached) return JSON.parse(cached);

  try {
    const res = await fetch("https://restcountries.com/v3.1/all");
    const data = await res.json();
    
    const existingCodes = new Set(COUNTRIES.map(c => c.code.toUpperCase()));

    const newCountries: Country[] = data
      .filter((d: any) => d.name?.common && d.cca2 && d.latlng && !existingCodes.has(d.cca2.toUpperCase()))
      .map((d: any) => ({
        code: d.cca2,
        name: d.name.common,
        emoji: d.flag || "🌍",
        lat: d.latlng[0],
        lon: d.latlng[1],
        blurb: "A beautiful destination waiting to be explored with GlobeX AI.",
        highlights: ["Local Landmarks", "Cultural Sites", "Nature"],
        hiddenGems: ["Quiet neighborhoods", "Authentic eateries"],
        food: ["Traditional dishes", "Street food", "Local desserts"],
        suggestedDays: "5–10 days",
        estBudget: "Varies",
        category: [],
        imageUrl: "",
      }));

    const combined = [...COUNTRIES, ...newCountries];
    sessionStorage.setItem("all_countries", JSON.stringify(combined));
    return combined;
  } catch (e) {
    console.error("Failed to fetch countries", e);
    return COUNTRIES;
  }
}
