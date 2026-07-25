"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type FaceState = "idle" | "listening" | "thinking" | "speaking";

export function HologramFace({ state, amplitude }: { state: FaceState; amplitude: number }) {
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const move = (event: MouseEvent) => setGaze({ x: Math.max(-3, Math.min(3, (event.clientX / window.innerWidth - 0.5) * 9)), y: Math.max(-2, Math.min(2, (event.clientY / window.innerHeight - 0.48) * 5)) });
    window.addEventListener("mousemove", move);
    const timer = window.setInterval(() => { setBlink(true); window.setTimeout(() => setBlink(false), 150); }, 3300);
    return () => { window.removeEventListener("mousemove", move); window.clearInterval(timer); };
  }, []);
  const talking = state === "speaking";
  const eyeScale = blink ? 0.08 : 1;
  const mouthOpen = talking ? 3 + amplitude * 11 : state === "listening" ? 1.3 : 1.7;
  const hue = state === "thinking" ? "#B388FF" : state === "listening" ? "#67E8F9" : "#F5F3FF";
  return <motion.div className={`face-shell ${state}`} animate={{ y: [0, -7, 0], rotate: state === "thinking" ? [-1, 1, -1] : [-0.5, 0.5, -0.5] }} transition={{ duration: state === "thinking" ? 2.2 : 5.5, repeat: Infinity, ease: "easeInOut" }}>
    <motion.div className="face-halo" animate={{ scale: state === "listening" ? [1, 1.1, 1] : [0.96, 1.04, 0.96], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: state === "listening" ? 1.1 : 3.2, repeat: Infinity }} />
    <svg viewBox="0 0 420 490" role="img" aria-label={`Lumora is ${state}`} className="hologram-face">
      <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="line" x1="0" x2="1"><stop stopColor="#67E8F9"/><stop offset="0.5" stopColor={hue}/><stop offset="1" stopColor="#A78BFA"/></linearGradient></defs>
      <g fill="none" stroke="url(#line)" strokeWidth="2" filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round">
        <path d="M96 170 C84 235 91 338 136 392 C163 424 187 439 210 442 C233 439 257 424 284 392 C329 338 336 235 324 170" opacity=".9"/>
        <path d="M105 170 C125 83 177 47 210 45 C243 47 295 83 315 170" opacity=".7"/>
        <path d="M140 114 L170 90 M280 114 L250 90 M126 137 L150 134 M294 137 L270 134" opacity=".5"/>
        <path d="M112 209 C142 187 171 187 193 205"/><path d="M308 209 C278 187 249 187 227 205"/>
        <path d="M170 210 C179 230 178 242 169 250 M250 210 C241 230 242 242 251 250" opacity=".55"/>
        <path d="M210 216 L196 274 L210 285 L224 274" opacity=".8"/>
        <motion.path d="M176 322 Q210 {322 + mouthOpen} 244 322" animate={{ d: `M176 322 Q210 ${322 + mouthOpen} 244 322` }} transition={{ duration: 0.12 }} />
        <path d="M154 353 Q210 379 266 353" opacity=".35"/><path d="M136 393 L127 454 M284 393 L293 454 M127 454 Q210 476 293 454" opacity=".66"/>
        <path d="M80 174 L112 188 M340 174 L308 188 M78 230 L108 230 M342 230 L312 230" opacity=".38"/>
      </g>
      <g fill={hue} filter="url(#glow)" transform={`translate(${gaze.x}, ${gaze.y})`}>
        <ellipse cx="168" cy="205" rx="15" ry={7 * eyeScale}/><ellipse cx="252" cy="205" rx="15" ry={7 * eyeScale}/>
      </g>
      <g fill={hue} opacity=".65"><circle cx="105" cy="149" r="2"/><circle cx="315" cy="149" r="2"/><circle cx="94" cy="280" r="2"/><circle cx="326" cy="280" r="2"/></g>
    </svg>
    {state === "listening" && <><span className="listen-ring ring-a"/><span className="listen-ring ring-b"/></>}
    {state === "thinking" && <div className="think-orbit"><i/><i/><i/></div>}
  </motion.div>;
}
