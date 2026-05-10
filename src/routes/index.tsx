import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PlacesPreview } from "@/components/PlacesPreview";
import { useAuth } from "@/hooks/useTrips";
import { Map, Plus } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GlobeX AI — Explore the world with AI travel planning" },
      { name: "description", content: "Spin a 3D globe, click a country, and let AI craft your perfect itinerary with budget, hidden gems, and bookings." },
      { property: "og:title", content: "GlobeX AI — AI-powered travel platform" },
      { property: "og:description", content: "Cinematic 3D globe + AI itinerary planner. Discover, plan, and book your next trip." },
    ],
  }),
  component: Index,
});

function Index() {
  const { isLoggedIn } = useAuth();

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <PlacesPreview />

      {/* Quick-access CTA banner */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold mb-3">
            Ready to plan your next <span className="text-gradient">adventure</span>?
          </h2>
          <p className="text-muted-foreground mb-8">
            Manage your trips, build day-by-day itineraries, and track your travel budget — all in one place.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {isLoggedIn ? (
              <>
                <Link
                  to="/trips/new"
                  id="hero-plan-trip-btn"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-transform"
                >
                  <Plus className="h-4 w-4" />
                  Plan a New Trip
                </Link>
                <Link
                  to="/dashboard"
                  id="hero-my-trips-btn"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass font-semibold hover:border-primary/40 transition-colors"
                >
                  <Map className="h-4 w-4" />
                  My Trips
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                id="hero-login-cta-btn"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-transform"
              >
                Get Started — It's Free
              </Link>
            )}
          </div>
        </div>
      </section>


    </main>
  );
}

