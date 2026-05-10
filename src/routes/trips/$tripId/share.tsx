import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Copy, MapPin, Calendar, Clock, Twitter, Facebook, Link2, Check } from "lucide-react";
import { useState } from "react";
import { useTrip } from "@/hooks/useTrips";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/trips/$tripId/share")({
  head: () => ({ meta: [{ title: "Share Itinerary — GlobeX AI" }] }),
  component: SharePage,
});

function SharePage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const trip = useTrip(tripId);
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/trips/${tripId}/share` : "";

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleCopyTrip() {
    if (!trip) return;
    const { name, startDate, endDate, description, stops } = trip;
    alert(`Trip "${name}" copied! In a full implementation, this would clone the trip to your account.`);
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const nights = trip ? Math.max(1, Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000)) : 0;
  const fmtCurrency = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  if (!trip) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Trip not found.</p></div>;

  const totalBudget = trip.stops.reduce((s, st) => s + st.activities.reduce((a, act) => a + act.cost, 0), 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate({ to: "/trips/$tripId/itinerary", params: { tripId } })}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />Back to Itinerary
          </button>

          {/* Share controls */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h1 className="font-display text-2xl font-bold mb-1 flex items-center gap-2">
              <Share2 className="h-6 w-6 text-primary" />Share Itinerary
            </h1>
            <p className="text-muted-foreground text-sm mb-5">Share your travel plan with friends and family</p>

            {/* Public/Private toggle */}
            <div className="flex items-center justify-between glass rounded-xl p-4 mb-5">
              <div>
                <p className="text-sm font-medium">{isPublic ? "Public — Anyone with link can view" : "Private — Only you can view"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{isPublic ? "Your itinerary is shareable" : "Enable to share this trip"}</p>
              </div>
              <button id="toggle-visibility-btn" onClick={() => setIsPublic(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${isPublic ? "bg-primary" : "bg-muted"}`}>
                <motion.div animate={{ x: isPublic ? 22 : 2 }} className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow" />
              </button>
            </div>

            {/* Share URL */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2 overflow-hidden">
                <Link2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{shareUrl}</span>
              </div>
              <button id="copy-link-btn" onClick={copyLink} disabled={!isPublic}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all ${copied ? "bg-neon/20 text-neon" : "bg-primary text-primary-foreground hover:scale-105"} disabled:opacity-40`}>
                {copied ? <><Check className="h-4 w-4" />Copied!</> : <><Copy className="h-4 w-4" />Copy</>}
              </button>
            </div>

            {/* Social share */}
            <div className="flex gap-2">
              <p className="text-xs text-muted-foreground mr-2 self-center">Share via:</p>
              {[
                { icon: <Twitter className="h-4 w-4" />, label: "Twitter", color: "hover:text-sky-400", href: `https://twitter.com/intent/tweet?text=Check+out+my+trip+to+${encodeURIComponent(trip.name)}!&url=${encodeURIComponent(shareUrl)}` },
                { icon: <Facebook className="h-4 w-4" />, label: "Facebook", color: "hover:text-blue-400", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
                { icon: <Link2 className="h-4 w-4" />, label: "WhatsApp", color: "hover:text-emerald-400", href: `https://wa.me/?text=${encodeURIComponent(`Check out my trip: ${trip.name} — ${shareUrl}`)}` },
              ].map(s => (
                <a key={s.label} href={isPublic ? s.href : "#"} target="_blank" rel="noreferrer"
                  className={`p-2.5 rounded-xl glass text-muted-foreground ${isPublic ? s.color : "opacity-40 cursor-not-allowed"} transition-colors`} title={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* READ-ONLY ITINERARY PREVIEW */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-display text-2xl font-bold mb-1">{trip.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />{fmtDate(trip.startDate)} → {fmtDate(trip.endDate)}
                </p>
              </div>
              <button id="copy-trip-btn" onClick={handleCopyTrip}
                className="px-4 py-2 rounded-xl glass text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                <Copy className="h-4 w-4" />Copy Trip
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-5">{trip.description}</p>

            {/* Trip stats */}
            <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-border">
              {[
                { label: "Nights", value: nights },
                { label: "Cities", value: trip.stops.length },
                { label: "Activities", value: trip.stops.reduce((s, st) => s + st.activities.length, 0) },
                { label: "Est. Budget", value: fmtCurrency(totalBudget) },
              ].map(s => (
                <div key={s.label} className="glass rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                  <div className="font-bold text-gradient">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Day-by-day timeline */}
            <div className="space-y-6">
              {trip.stops.map((stop, idx) => (
                <motion.div key={stop.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  className="relative pl-8">
                  {idx < trip.stops.length - 1 && <div className="absolute left-3 top-8 bottom-0 w-px bg-gradient-to-b from-primary/40 to-transparent" />}
                  <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg mb-0.5">{stop.city}</h3>
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(stop.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} →{" "}
                      {new Date(stop.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    {stop.activities.length > 0 ? (
                      <div className="space-y-2">
                        {stop.activities.map(act => (
                          <div key={act.id} className="bg-white/3 rounded-xl px-4 py-2.5 flex items-center gap-3">
                            {act.time && <span className="text-xs text-primary font-medium flex items-center gap-1 shrink-0"><Clock className="h-3 w-3" />{act.time}</span>}
                            <span className="text-sm flex-1">{act.title}</span>
                            {act.cost > 0 && <span className="text-xs text-neon font-semibold shrink-0">{fmtCurrency(act.cost)}</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No activities planned yet.</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
