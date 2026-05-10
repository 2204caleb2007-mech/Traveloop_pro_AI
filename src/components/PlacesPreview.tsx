import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

const CATEGORIES = [
  {
    id: "Beaches",
    title: "Beaches",
    subtitle: "Sun, sand, and surf",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "Mountains",
    title: "Mountains",
    subtitle: "Alpine adventures",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "Historical",
    title: "Historical",
    subtitle: "Step back in time",
    image: "https://images.unsplash.com/photo-1594026200204-a25bea256816?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "Budget",
    title: "Budget",
    subtitle: "Explore for less",
    image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "Luxury",
    title: "Luxury",
    subtitle: "Premium getaways",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "Hidden Gems",
    title: "Hidden Gems",
    subtitle: "Off the beaten path",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop",
  }
];

export function PlacesPreview() {
  return (
    <section id="categories" className="relative py-24 px-6 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold">
            Travel by <span className="text-gradient">Experience</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-lg">
            Discover your next destination based on what moves you.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.id}
              to="/cities"
              search={{ category: c.id }}
              className="block outline-none"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative h-72 sm:h-80 w-full rounded-3xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2"
              >
                <img
                  src={c.image}
                  alt={c.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute bottom-6 left-5 right-5 text-left">
                  <h3 className="font-display text-2xl font-bold text-white mb-1 drop-shadow-md group-hover:text-primary transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-white/80 text-sm italic font-medium drop-shadow-sm transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    {c.subtitle}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
