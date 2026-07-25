"use client";

import { Mic, MicOff, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

export function VoiceOrb({ state, amplitude, onClick, disabled }: { state: "idle" | "listening" | "thinking" | "speaking"; amplitude: number; onClick: () => void; disabled?: boolean }) {
  const Icon = state === "speaking" ? Volume2 : disabled ? MicOff : Mic;
  return <div className="voice-orb-wrap">
    {(state === "listening" || state === "speaking") && [0, 1, 2].map((ring) => <motion.span key={ring} className="voice-wave" animate={{ scale: [1, 1.25 + amplitude * 0.6, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.25, repeat: Infinity, delay: ring * 0.32 }} />)}
    <motion.button type="button" className={`voice-orb ${state}`} onClick={onClick} disabled={disabled} whileTap={{ scale: 0.94 }} aria-label={state === "listening" ? "Stop listening" : "Start voice conversation"}>
      <Icon size={25} strokeWidth={1.7}/>
      <span>{state === "listening" ? "Listening" : state === "thinking" ? "Thinking" : state === "speaking" ? "Speaking" : "Speak"}</span>
    </motion.button>
  </div>;
}
