"use client";

import { motion } from "framer-motion";

const stars = Array.from({ length: 38 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 61) % 100}%`,
  size: index % 5 === 0 ? 3 : 1.5,
  duration: 4 + (index % 6),
}));

export function AmbientBackground({ state }: { state: "idle" | "listening" | "thinking" | "speaking" }) {
  return <div className="ambient" aria-hidden="true">
    <div className={`orb orb-one ${state}`} /><div className={`orb orb-two ${state}`} />
    <div className="grid-floor" />
    {stars.map((star) => <motion.i key={star.id} className="star" style={{ left: star.left, top: star.top, width: star.size, height: star.size }} animate={{ opacity: [0.18, 0.9, 0.18], y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: star.duration, delay: star.id * 0.12 }} />)}
  </div>;
}
