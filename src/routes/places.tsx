import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PlacesPreview } from "@/components/PlacesPreview";

export const Route = createFileRoute("/places")({
  head: () => ({
    meta: [
      { title: "Places — GlobeX AI" },
      { name: "description", content: "Browse countries and curated travel categories — beaches, mountains, hidden gems, and more." },
      { property: "og:title", content: "Places — GlobeX AI" },
      { property: "og:description", content: "Discover destinations across every continent." },
    ],
  }),
  component: PlacesPage,
});

function PlacesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24">
        <PlacesPreview />
      </div>
    </main>
  );
}
