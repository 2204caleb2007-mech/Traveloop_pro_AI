import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Globe } from "@/components/globe/Globe";
import type { Country } from "@/lib/countries";
import { CountryDrawer } from "@/components/CountryDrawer";

export function Hero() {
  const [active, setActive] = useState<Country | null>(null);

  const scrollToPlaces = () => {
    document.getElementById("places")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative grid min-h-[100svh] grid-cols-1 items-center gap-8 px-4 pt-24 md:pt-28 md:px-10 lg:grid-cols-2">
        {/* Left: copy */}
        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground"
          >
            <Sparkles className="h-3 w-3 text-[var(--neon-cyan)]" />
            AI-powered travel operating system
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="font-display mt-5 text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
          >
            Explore the world with{" "}
            <span className="text-gradient">AI-powered</span> travel planning.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Spin the globe. Pick a country. Let AI craft a day-by-day
            itinerary, calculate budgets, and book the trip — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.32 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <button
              onClick={scrollToPlaces}
              className="btn-hero inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              Go around the world
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-10 flex items-center gap-5 text-xs text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_10px_var(--neon-cyan)]" />
              12+ destinations
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon-violet)] shadow-[0_0_10px_var(--neon-violet)]" />
              Booking partners
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon-blue)] shadow-[0_0_10px_var(--neon-blue)]" />
              Smart budgeting
            </span>
          </motion.div>
        </div>

        {/* Right: Globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[60svh] w-full lg:h-[80svh]"
        >
          <Globe onCountryClick={setActive} className="!h-full" />
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full glass px-3 py-1.5 text-[11px] text-muted-foreground">
            Drag to rotate · click a glowing pin
          </div>
        </motion.div>
      </div>

      <CountryDrawer country={active} onClose={() => setActive(null)} />
    </section>
  );
}
