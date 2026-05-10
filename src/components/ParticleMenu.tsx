import { AnimatePresence, motion } from "framer-motion";
import { User, KeyRound, Sparkles, LifeBuoy, Mail, LogOut } from "lucide-react";

const items = [
  { icon: User, label: "Profile" },
  { icon: KeyRound, label: "Change Password" },
  { icon: Sparkles, label: "Services" },
  { icon: LifeBuoy, label: "Support" },
  { icon: Mail, label: "Contact" },
  { icon: LogOut, label: "Logout" },
];

const PARTICLES = 28;

export function ParticleMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
          />
          <div className="fixed top-20 right-8 z-50 pointer-events-none">
            <div className="relative">
              {/* gaseous particle burst */}
              {Array.from({ length: PARTICLES }).map((_, i) => {
                const angle = (i / PARTICLES) * Math.PI * 2;
                const dist = 80 + Math.random() * 120;
                const x = Math.cos(angle) * dist;
                const y = Math.sin(angle) * dist;
                const hue = i % 2 === 0 ? "var(--primary)" : "var(--accent)";
                return (
                  <motion.span
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{ x, y, opacity: [0, 0.8, 0], scale: [0, 2, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.01 }}
                    className="absolute top-0 right-0 w-3 h-3 rounded-full blur-md"
                    style={{ background: hue }}
                  />
                );
              })}

              {/* menu panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, filter: "blur(20px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.7, filter: "blur(16px)" }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                className="glass rounded-2xl p-2 w-60 pointer-events-auto "
              >
                {items.map((it, i) => (
                  <motion.button
                    key={it.label}
                    initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors text-left"
                  >
                    <it.icon className="h-4 w-4 text-primary" />
                    <span>{it.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
