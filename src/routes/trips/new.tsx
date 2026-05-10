import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Image,
  MapPin,
  Save,
  Tag,
  X,
} from "lucide-react";
import { useState, useRef } from "react";
import { tripStore } from "@/lib/tripStore";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/trips/new")({
  head: () => ({
    meta: [
      { title: "Plan a New Trip — GlobeX AI" },
      { name: "description", content: "Start planning your next adventure by filling in trip details." },
    ],
  }),
  component: NewTripPage,
});

function NewTripPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Trip name is required";
    if (!startDate) e.startDate = "Start date is required";
    if (!endDate) e.endDate = "End date is required";
    if (startDate && endDate && endDate < startDate) e.endDate = "End date must be after start date";
    if (!description.trim()) e.description = "Please add a short description";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const trip = tripStore.add({
      name: name.trim(),
      startDate,
      endDate,
      description: description.trim(),
      coverPhoto: coverPhoto ?? undefined,
    });
    setSaving(false);
    navigate({ to: "/trips/$tripId/itinerary", params: { tripId: trip.id } });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Trips
          </button>

          <h1 className="font-display text-3xl font-bold mb-1">Plan a New Trip</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Give your adventure a name and some dates to get started.
          </p>

          <form onSubmit={handleSave} className="space-y-6" noValidate>
            {/* Cover Photo */}
            <div
              id="cover-photo-upload"
              onClick={() => fileRef.current?.click()}
              className="relative w-full h-44 glass rounded-2xl overflow-hidden cursor-pointer group hover:border-primary/40 transition-colors border-2 border-dashed border-border"
              style={coverPhoto ? { backgroundImage: `url(${coverPhoto})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
            >
              {!coverPhoto && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  <Image className="h-8 w-8" />
                  <span className="text-sm font-medium">Upload Cover Photo</span>
                  <span className="text-xs">Optional · JPG, PNG, WEBP</span>
                </div>
              )}
              {coverPhoto && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="text-white text-sm font-medium">Change photo</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCoverPhoto(null); }}
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </div>

            {/* Trip name */}
            <FormField
              id="trip-name"
              label="Trip Name"
              error={errors.name}
              icon={<Tag className="h-4 w-4" />}
            >
              <input
                id="trip-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer in Tuscany"
                className={`w-full bg-input/50 border ${errors.name ? "border-destructive" : "border-border"} rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition`}
              />
            </FormField>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField id="trip-start-date" label="Start Date" error={errors.startDate} icon={<Calendar className="h-4 w-4" />}>
                <input
                  id="trip-start-date"
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full bg-input/50 border ${errors.startDate ? "border-destructive" : "border-border"} rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition`}
                />
              </FormField>
              <FormField id="trip-end-date" label="End Date" error={errors.endDate} icon={<Calendar className="h-4 w-4" />}>
                <input
                  id="trip-end-date"
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full bg-input/50 border ${errors.endDate ? "border-destructive" : "border-border"} rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition`}
                />
              </FormField>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="trip-description" className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Description
              </label>
              <textarea
                id="trip-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this trip about? Where are you headed? Any must-see spots?"
                rows={4}
                className={`w-full bg-input/50 border ${errors.description ? "border-destructive" : "border-border"} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition resize-none`}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            {/* Destination hint */}
            <div className="glass rounded-xl p-4 flex gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-0.5">Add stops next</p>
                <p className="text-xs text-muted-foreground">
                  After saving, you'll be taken to the itinerary builder where you can add cities, dates, and activities.
                </p>
              </div>
            </div>

            <button
              id="save-trip-btn"
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              {saving ? (
                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save & Build Itinerary
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function FormField({
  id,
  label,
  icon,
  error,
  children,
}: {
  id: string;
  label: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium block">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
            {icon}
          </div>
        )}
        {children}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
