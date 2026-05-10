import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles, Wallet, Clock } from "lucide-react";
import type { Country } from "./InteractiveGlobe";

export function CountryPanel({ country, onClose }: { country: Country | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {country && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[460px] glass border-l border-border p-6 overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5">
              <X className="h-5 w-5" />
            </button>
            <div className="text-6xl mb-4">{country.emoji}</div>
            <h2 className="text-3xl font-bold text-gradient">{country.name}</h2>
            <p className="text-muted-foreground mt-2">{country.blurb}</p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat icon={Clock} label="Days" value="5–7" />
              <Stat icon={Wallet} label="Budget" value="$$" />
              <Stat icon={Sparkles} label="Vibe" value="Magical" />
            </div>

            <h3 className="mt-8 mb-3 text-sm uppercase tracking-widest text-muted-foreground">Famous places</h3>
            <ul className="space-y-2">
              {country.highlights.map((h) => (
                <li key={h} className="glass rounded-xl px-4 py-3 flex items-center justify-between hover:border-primary/40 transition-colors">
                  <span>{h}</span>
                  <span className="text-xs text-primary">Explore →</span>
                </li>
              ))}
            </ul>

            <button className="w-full mt-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-[1.02] transition-transform">
              ✨ Plan with AI
            </button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <Icon className="h-4 w-4 mx-auto text-primary mb-1" />
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
