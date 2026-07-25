"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Command, Leaf, Menu, Send, Sparkles, VolumeX, X } from "lucide-react";
import { AmbientBackground } from "@/components/ambient-background";
import { HologramFace } from "@/components/hologram-face";
import { VoiceOrb } from "@/components/voice-orb";
import { InsightPanel } from "@/components/insight-panel";
import { JournalSheet } from "@/components/journal-sheet";
import { MemoryDock } from "@/components/memory-dock";
import { demoEntries, demoInsights, weeklyMood } from "@/lib/demo-data";
import { parseVoiceCommand } from "@/lib/commands";
import type { ConversationMessage, Insight, JournalEntry } from "@/lib/types";

type RoomState = "idle" | "listening" | "thinking" | "speaking";
type SpeechResultEvent = Event & { results: ArrayLike<{ 0?: { transcript?: string }; isFinal?: boolean }> };
type SpeechRecognitionInstance = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: SpeechResultEvent) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start: () => void; stop: () => void };
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export function CompanionRoom() {
  const [state, setState] = useState<RoomState>("idle");
  const [amplitude, setAmplitude] = useState(0.08);
  const [typedMessage, setTypedMessage] = useState("");
  const [transcript, setTranscript] = useState("");
  const [journalOpen, setJournalOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>(demoEntries);
  const [insights, setInsights] = useState<Insight[]>(demoInsights);
  const [mood, setMood] = useState(weeklyMood);
  const [messages, setMessages] = useState<ConversationMessage[]>([{ id: "welcome", role: "assistant", content: "Welcome back. You’ve been building something meaningful this week. How are you arriving today?", createdAt: new Date().toISOString() }]);

  useEffect(() => {
    void Promise.all([fetch("/api/journal"), fetch("/api/insights")]).then(async ([journalResponse, insightResponse]) => {
      if (journalResponse.ok) { const data = await journalResponse.json() as { entries: JournalEntry[] }; setEntries(data.entries); }
      if (insightResponse.ok) { const data = await insightResponse.json() as { insights: Insight[]; weeklyMood: typeof weeklyMood }; setInsights(data.insights); setMood(data.weeklyMood); }
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (state === "idle" || state === "thinking") { setAmplitude(0.06); return; }
    const interval = window.setInterval(() => setAmplitude(state === "speaking" ? 0.18 + Math.random() * 0.72 : 0.1 + Math.random() * 0.55), 130);
    return () => window.clearInterval(interval);
  }, [state]);

  const speak = useCallback((text: string) => {
    if (muted || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.03; utterance.pitch = 1.04;
    utterance.onstart = () => setState("speaking");
    utterance.onend = () => setState("idle");
    utterance.onerror = () => setState("idle");
    window.speechSynthesis.speak(utterance);
  }, [muted]);

  const addReply = useCallback(async (message: string) => {
    const command = parseVoiceCommand(message);
    const userMessage: ConversationMessage = { id: crypto.randomUUID(), role: "user", content: message, createdAt: new Date().toISOString() };
    setMessages((current) => [...current, userMessage]);
    setTypedMessage(""); setTranscript("");
    if (command?.panel === "journal") setJournalOpen(true);
    if (command?.panel === "insights") setInsightsOpen(true);
    setState("thinking");
    try {
      const history = messages.slice(-8).map(({ role, content }) => ({ role, content }));
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, history }) });
      const data = await response.json() as { reply?: string; error?: string };
      const reply = command?.response ?? data.reply ?? "I’m here with you. Could you say that one more time?";
      const assistantMessage: ConversationMessage = { id: crypto.randomUUID(), role: "assistant", content: reply, createdAt: new Date().toISOString() };
      setMessages((current) => [...current, assistantMessage]);
      speak(reply);
      if (muted) setState("idle");
    } catch {
      const reply = "I lost the thread for a second, but I’m still here. What feels most important to name right now?";
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: reply, createdAt: new Date().toISOString() }]);
      setState("idle");
    }
  }, [messages, muted, speak]);

  const toggleVoice = () => {
    if (state === "listening") { setState("thinking"); return; }
    const browser = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognition) { setTranscript("Voice capture is not available in this browser. You can still type below."); return; }
    const recognition = new Recognition();
    recognition.lang = "en-IN"; recognition.continuous = false; recognition.interimResults = true;
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const words = last?.[0]?.transcript?.trim() ?? "";
      setTranscript(words);
      if (last?.isFinal && words) { setState("thinking"); void addReply(words); }
    };
    recognition.onerror = () => { setTranscript("I didn’t catch that. Tap and try once more."); setState("idle"); };
    recognition.onend = () => setState((current) => current === "listening" ? "idle" : current);
    setState("listening"); recognition.start();
  };

  const latestAssistantMessage = useMemo(() => [...messages].reverse().find((message) => message.role === "assistant"), [messages]);
  const submitTyped = (event: React.FormEvent) => { event.preventDefault(); if (typedMessage.trim() && state !== "thinking") void addReply(typedMessage.trim()); };
  const active = journalOpen ? "journal" : insightsOpen ? "insights" : null;

  return <main className="lumora-room">
    <AmbientBackground state={state}/>
    <header className="topbar"><a className="brand" href="#home" aria-label="Lumora home"><span className="brand-mark"><i/><i/><i/></span><span>LUMORA</span></a><div className="topbar-center"><span className="presence-dot"/> <span>Companion online</span></div><div className="topbar-actions"><button className="icon-button" onClick={() => setMuted((value) => !value)} aria-label={muted ? "Unmute Lumora" : "Mute Lumora"}>{muted ? <VolumeX size={18}/> : <Bell size={18}/>}</button><button className="avatar" onClick={() => setMenuOpen((value) => !value)} aria-label="Open profile menu">AS</button></div></header>
    <div className="room-content">
      <MemoryDock entries={entries} active={active} onOpenJournal={() => setJournalOpen(true)} onOpenInsights={() => setInsightsOpen(true)}/>
      <section className="companion-stage" aria-live="polite">
        <div className="stage-copy"><motion.span className="state-label" key={state} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}><i/> {state === "idle" ? "Present with you" : state === "listening" ? "I’m listening" : state === "thinking" ? "Finding the thread" : "Speaking with you"}</motion.span><h1>{state === "listening" ? "Take your time." : state === "thinking" ? "I’m here." : "Your inner world,\nheld gently."}</h1><p>{transcript || latestAssistantMessage?.content}</p></div>
        <HologramFace state={state} amplitude={amplitude}/>
        <VoiceOrb state={state} amplitude={amplitude} onClick={toggleVoice}/>
        <p className="voice-hint">Tap to speak · Say “open today’s journal” · <kbd>Space</kbd> to begin</p>
      </section>
      <InsightPanel insights={insights} mood={mood}/>
    </div>
    <form className="conversation-bar" onSubmit={submitTyped}><div className="shortcut"><Command size={14}/><span>K</span></div><input value={typedMessage} onChange={(event) => setTypedMessage(event.target.value)} placeholder="Or leave Lumora a thought…" aria-label="Message Lumora"/><button type="submit" className="send-button" disabled={!typedMessage.trim() || state === "thinking"}><Send size={17}/></button></form>
    <AnimatePresence>{menuOpen && <motion.div className="profile-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><strong>Arjun S.</strong><span>12-day reflection rhythm</span><button onClick={() => setMenuOpen(false)}>Settings</button><button onClick={() => setMenuOpen(false)}>Sign out</button></motion.div>}</AnimatePresence>
    <AnimatePresence>{insightsOpen && <motion.div className="drawer-backdrop" onMouseDown={() => setInsightsOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.aside className="insight-drawer" role="dialog" aria-modal="true" aria-label="Life insights" onMouseDown={(event) => event.stopPropagation()} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }}><button className="icon-button close-drawer" onClick={() => setInsightsOpen(false)} aria-label="Close insights"><X size={18}/></button><InsightPanel insights={insights} mood={mood}/><div className="coach-note"><Leaf size={18}/><div><strong>A pattern worth protecting</strong><p>Your most peaceful entries follow time outdoors. Keep one small pocket of that rhythm this weekend.</p></div></div></motion.aside></motion.div>}</AnimatePresence>
    <JournalSheet open={journalOpen} onClose={() => setJournalOpen(false)} seedText={transcript} onSaved={(entry) => setEntries((current) => [entry, ...current])}/>
  </main>;
}
