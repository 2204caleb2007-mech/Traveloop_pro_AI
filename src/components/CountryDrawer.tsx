import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { X, Sparkles, MapPin, Utensils, Calendar, Wallet } from "lucide-react";
import type { Country } from "@/lib/countries";

type Props = { country: Country | null; onClose: () => void };

export function CountryDrawer({ country, onClose }: Props) {
  return (
    <AnimatePresence>
      {country && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="glass fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto p-6 md:p-8"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-secondary/60"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mt-2 text-5xl">{country.emoji}</div>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight">
              {country.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{country.blurb}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Stat icon={Calendar} label="Suggested" value={country.suggestedDays} />
              <Stat icon={Wallet} label="Estimated" value={country.estBudget} />
            </div>

            <Section title="Famous places" icon={MapPin} items={country.highlights} />
            <Section title="Hidden gems" icon={Sparkles} items={country.hiddenGems} />
            <Section title="Food culture" icon={Utensils} items={country.food} />

            <Link
              to="/ai-planner"
              search={{ destination: country.name }}
              className="btn-hero mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              Plan a trip with AI
              <Sparkles className="h-4 w-4" />
            </Link>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof MapPin;
  items: string[];
}) {
  return (
    <div className="mt-6">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-[var(--neon-cyan)]" /> {title}
      </h3>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {items.map((it) => (
          <li
            key={it}
            className="rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-xs"
          >
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
