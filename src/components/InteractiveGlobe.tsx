import { lazy, Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Globe = lazy(() => import("react-globe.gl").then((m) => ({ default: m.default as unknown as React.ComponentType<any> })));

export type Country = {
  name: string;
  lat: number;
  lng: number;
  emoji: string;
  blurb: string;
  highlights: string[];
};

export const COUNTRIES: Country[] = [
  { name: "Japan", lat: 36.2, lng: 138.25, emoji: "🗾", blurb: "Neon cities, ancient temples, cherry blossoms.", highlights: ["Tokyo", "Kyoto", "Mt. Fuji", "Osaka street food"] },
  { name: "USA", lat: 39.5, lng: -98.35, emoji: "🗽", blurb: "From canyons to skylines.", highlights: ["NYC", "Grand Canyon", "Yosemite", "New Orleans"] },
  { name: "France", lat: 46.6, lng: 2.2, emoji: "🥐", blurb: "Romance, cuisine, art.", highlights: ["Paris", "Provence", "French Riviera", "Mont Saint-Michel"] },
  { name: "India", lat: 22.35, lng: 78.66, emoji: "🛕", blurb: "Color, spice, sacred rivers.", highlights: ["Taj Mahal", "Kerala", "Jaipur", "Ladakh"] },
  { name: "Switzerland", lat: 46.82, lng: 8.23, emoji: "🏔️", blurb: "Alpine fairytale.", highlights: ["Zermatt", "Lucerne", "Jungfrau", "Interlaken"] },
  { name: "Brazil", lat: -14.24, lng: -51.93, emoji: "🌴", blurb: "Rhythm and rainforest.", highlights: ["Rio", "Amazon", "Iguazu", "Salvador"] },
  { name: "Egypt", lat: 26.82, lng: 30.8, emoji: "🐫", blurb: "Pyramids and the Nile.", highlights: ["Cairo", "Luxor", "Aswan", "Red Sea"] },
  { name: "Australia", lat: -25.27, lng: 133.77, emoji: "🦘", blurb: "Reefs, outback, beaches.", highlights: ["Sydney", "Great Barrier Reef", "Uluru", "Melbourne"] },
  { name: "Iceland", lat: 64.96, lng: -19.02, emoji: "❄️", blurb: "Geysers, glaciers, auroras.", highlights: ["Reykjavik", "Blue Lagoon", "Vík", "Northern Lights"] },
  { name: "Italy", lat: 41.87, lng: 12.56, emoji: "🍝", blurb: "Art, ruins, pasta.", highlights: ["Rome", "Venice", "Amalfi", "Tuscany"] },
];

export function InteractiveGlobe({ onSelect }: { onSelect: (c: Country) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [size, setSize] = useState({ w: 500, h: 500 });

  useEffect(() => {
    const update = () => {
      if (!wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      const s = Math.min(r.width, r.height || r.width);
      setSize({ w: s, h: s });
    };
    update();
    const ro = new ResizeObserver(update);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let interval = setInterval(() => {
      const g = globeRef.current;
      if (g && g.controls) {
        clearInterval(interval);
        
        // Apply controls once the globe is fully loaded
        const controls = g.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;
        controls.enableZoom = false; // Disable scroll-based zooming entirely
        
        // Restrict to horizontal rotation only
        controls.minPolarAngle = Math.PI / 2;
        controls.maxPolarAngle = Math.PI / 2;

        g.pointOfView({ lat: 0, lng: 10, altitude: 2.2 }, 0);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full aspect-square max-w-[640px] mx-auto animate-float">
      {/* glow */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
      <Suspense fallback={<div className="absolute inset-0 rounded-full bg-secondary/40 animate-pulse" />}>
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          atmosphereColor="#7dd3fc"
          atmosphereAltitude={0.22}
          customLayerData={COUNTRIES}
          customThreeObject={(d: any) => {
            const vertices = new Float32Array([
               0, 0, 0,   // tip at the globe surface
              -1.2, 0, 3.5, // base corner
               1.2, 0, 3.5  // base corner
            ]);
            const geom = new THREE.BufferGeometry();
            geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            const material = new THREE.MeshBasicMaterial({ color: "#22d3ee", side: THREE.DoubleSide });
            return new THREE.Mesh(geom, material);
          }}
          onCustomLayerHover={(d: any) => {
            if (globeRef.current) globeRef.current.controls().autoRotate = !d;
          }}
          customLayerLabel={(d: any) => `<div style="background:rgba(20,20,30,0.9);padding:6px 10px;border-radius:8px;border:1px solid #22d3ee;color:white;font-family:Inter">${d.name}</div>`}
          onCustomLayerClick={(d: any) => onSelect(d as Country)}
          ringsData={COUNTRIES}
          ringLat="lat"
          ringLng="lng"
          ringColor={() => (t: number) => `rgba(125,211,252,${1 - t})`}
          ringMaxRadius={3}
          ringPropagationSpeed={2}
          ringRepeatPeriod={1400}
        />
      </Suspense>
    </div>
  );
}
