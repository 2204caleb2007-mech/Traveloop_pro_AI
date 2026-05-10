import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, Save, ExternalLink } from "lucide-react";
import { planTrip, type Itinerary } from "@/lib/planner.functions";
import { COUNTRIES } from "@/lib/countries";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const search = z.object({ destination: z.string().optional() });

export const Route = createFileRoute("/ai-planner")({
  component: Planner,
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "AI Trip Planner — GlobeX AI" },
      {
        name: "description",
        content:
          "Generate a complete day-by-day itinerary, budget breakdown, and hidden gems with AI in seconds.",
      },
    ],
  }),
});

type BudgetTier = "low" | "medium" | "high";
type Mode = "best" | "hidden" | "budget" | "mix";

function Planner() {
  const { destination: initial } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const planFn = useServerFn(planTrip);

  const [destination, setDestination] = useState(initial ?? "");
  const [travelers, setTravelers] = useState(2);
  const [customBudget, setCustomBudget] = useState("");
  const [tier, setTier] = useState<BudgetTier>("medium");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [mode, setMode] = useState<Mode>("mix");
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!destination || !start || !end) {
      toast.error("Fill in destination and dates");
      return;
    }
    setLoading(true);
    setItinerary(null);
    const result = await planFn({
      data: {
        destination,
        travelers,
        budgetTier: tier,
        customBudget,
        startDate: start,
        endDate: end,
        mode,
      },
    });
    setLoading(false);
    if (result.error || !result.itinerary) {
      toast.error(result.error || "Couldn't generate trip");
      return;
    }
    setItinerary(result.itinerary);
  };

  const handleQuickPlan = async () => {
    if (!destination) {
      toast.error("Please select a destination first!");
      return;
    }
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    setStart(format(today, "yyyy-MM-dd"));
    setEnd(format(nextWeek, "yyyy-MM-dd"));
    setMode("mix");
    setTier("medium");
    setCustomBudget("");
    
    setLoading(true);
    setItinerary(null);
    const result = await planFn({
      data: {
        destination,
        travelers: 2,
        budgetTier: "medium",
        customBudget: "",
        startDate: format(today, "yyyy-MM-dd"),
        endDate: format(nextWeek, "yyyy-MM-dd"),
        mode: "mix",
      },
    });
    setLoading(false);
    if (result.error || !result.itinerary) {
      toast.error(result.error || "Couldn't generate trip");
      return;
    }
    setItinerary(result.itinerary);
  };

  const saveTrip = async () => {
    if (!user) {
      toast("Sign in to save trips", {
        action: { label: "Login", onClick: () => navigate({ to: "/login" }) },
      });
      return;
    }
    if (!itinerary) return;
    setSaving(true);
    const { error } = await supabase.from("saved_trips").insert({
      user_id: user.id,
      destination,
      travelers,
      budget_tier: tier,
      start_date: start,
      end_date: end,
      itinerary: itinerary as never,
      total_budget: itinerary.budget.total,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Trip saved!");
  };

  const handleDownload = () => {
    if (!itinerary) return;
    const content = `
Trip to ${destination}
${itinerary.summary}

Estimated Budget: $${itinerary.budget.total} USD
---
${itinerary.days.map(d => `Day ${d.day}: ${d.title}\nActivities:\n${d.activities.map(a => `- ${a}`).join('\n')}\nFood: ${d.food.join(', ')}\nStay: ${d.stay}`).join('\n\n')}

Tips:
${itinerary.tips.map(t => `- ${t}`).join('\n')}

Hidden Gems:
${itinerary.hiddenGems.map(h => `- ${h}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GlobeX_Itinerary_${destination.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <Navbar />
    <div className="mx-auto max-w-6xl px-4 md:px-10 pt-32 pb-24">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="font-display text-balance text-5xl font-semibold tracking-tight md:text-6xl"
      >
        Ask the <span className="text-gradient">AI</span>.
      </motion.h1>
      <p className="mt-3 text-muted-foreground max-w-xl">
        Tell us the basics. We&apos;ll return a day-by-day plan with budget,
        hotels, food, and hidden gems.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[400px_1fr]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="glass space-y-4 rounded-2xl p-6"
        >
          <Field label="Destination">
            <input
              list="destinations"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Japan, Iceland, Bali…"
              className="w-full rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none"
            />
            <datalist id="destinations">
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name} />
              ))}
            </datalist>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Travelers">
              <input
                type="number"
                min={1}
                max={20}
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value || "1"))}
                className="w-full rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none"
              />
            </Field>
            <Field label="Custom Budget ($)">
              <input
                type="text"
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none"
              />
            </Field>
          </div>

          <Field label="Budget tier">
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as BudgetTier[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setTier(b)}
                  className={`rounded-xl border px-3 py-2 text-xs uppercase tracking-wider transition ${
                    tier === b
                      ? "border-[var(--neon-cyan)]/60 bg-[var(--neon-cyan)]/10"
                      : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start">
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none"
                  >
                    <span className={start ? "text-foreground" : "text-muted-foreground"}>
                      {start ? format(new Date(start), "PPP") : "Pick a date"}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content align="start" className="z-50 rounded-2xl border border-border bg-background p-3 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                    <DayPicker
                      mode="single"
                      selected={start ? new Date(start) : undefined}
                      onSelect={(d) => setStart(d ? format(d, "yyyy-MM-dd") : "")}
                    />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </Field>
            <Field label="End">
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none"
                  >
                    <span className={end ? "text-foreground" : "text-muted-foreground"}>
                      {end ? format(new Date(end), "PPP") : "Pick a date"}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content align="start" className="z-50 rounded-2xl border border-border bg-background p-3 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                    <DayPicker
                      mode="single"
                      selected={end ? new Date(end) : undefined}
                      onSelect={(d) => setEnd(d ? format(d, "yyyy-MM-dd") : "")}
                      disabled={start ? { before: new Date(start) } : undefined}
                    />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </Field>
          </div>

          <Field label="Recommendation mode">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["best", "All-time best"],
                  ["hidden", "Hidden gems"],
                  ["budget", "Budget-friendly"],
                  ["mix", "Mix of all"],
                ] as [Mode, string][]
              ).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-xl border px-3 py-2 text-xs transition ${
                    mode === m
                      ? "border-[var(--neon-violet)]/60 bg-[var(--neon-violet)]/10"
                      : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-hero inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Crafting…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleQuickPlan}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--neon-violet)]/40 bg-[var(--neon-violet)]/10 px-6 py-3 text-sm font-semibold text-[var(--neon-violet)] hover:bg-[var(--neon-violet)]/20 transition disabled:opacity-60"
            >
              Quick Plan
            </button>
          </div>
        </form>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass grid h-full place-items-center rounded-2xl p-10"
              >
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--neon-cyan)]" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    AI is plotting your route…
                  </p>
                </div>
              </motion.div>
            )}

            {!loading && !itinerary && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass grid h-full place-items-center rounded-2xl p-10 text-center"
              >
                <div>
                  <Sparkles className="mx-auto h-8 w-8 text-[var(--neon-violet)]" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Your itinerary will appear here.
                  </p>
                </div>
              </motion.div>
            )}

            {itinerary && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="glass rounded-2xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-2xl font-semibold">
                        {destination}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {itinerary.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveTrip}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs hover:border-primary/40 transition"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--neon-cyan)]/40 bg-[var(--neon-cyan)]/10 px-4 py-2 text-xs text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 transition"
                      >
                        Download Report
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-6 text-xs">
                    {Object.entries(itinerary.budget)
                      .filter(([k]) => k !== "currency")
                      .map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-xl border border-border bg-secondary/20 p-2.5"
                        >
                          <div className="text-muted-foreground capitalize">{k}</div>
                          <div className="font-semibold">
                            ${typeof v === "number" ? v.toLocaleString() : v}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  {itinerary.days.map((d) => (
                    <div key={d.day} className="glass rounded-2xl p-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-violet)] text-xs font-bold text-background">
                          {d.day}
                        </div>
                        <h3 className="font-display text-lg font-semibold">
                          {d.title}
                        </h3>
                      </div>
                      <ul className="mt-3 space-y-1 pl-12 text-sm text-muted-foreground">
                        {d.activities.map((a, i) => (
                          <li key={i} className="list-disc">
                            {a}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 pl-12 text-xs text-muted-foreground">
                        🍽 {d.food.join(", ")} · 🏨 {d.stay}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="glass rounded-2xl p-5">
                    <h3 className="font-display text-lg font-semibold">
                      Practical tips
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {itinerary.tips.map((t, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--neon-cyan)]" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <h3 className="font-display text-lg font-semibold">
                      Hidden gems
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {itinerary.hiddenGems.map((t, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--neon-violet)]" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="font-display text-lg font-semibold">
                    Book with partners
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      ["Booking.com", `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`],
                      ["Airbnb", `https://www.airbnb.com/s/${encodeURIComponent(destination)}`],
                      ["Klook", `https://www.klook.com/search/?keyword=${encodeURIComponent(destination)}`],
                      ["TripAdvisor", `https://www.tripadvisor.com/Search?q=${encodeURIComponent(destination)}`],
                    ].map(([label, href]) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/30 px-4 py-2 text-sm hover:bg-secondary/60 hover:border-primary/40 transition"
                      >
                        {label} <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
