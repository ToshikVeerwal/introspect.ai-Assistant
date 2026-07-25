"use client";

import { useState } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { JournalEntry } from "@/lib/types";

export function JournalSheet({ open, onClose, onSaved, seedText = "" }: { open: boolean; onClose: () => void; onSaved: (entry: JournalEntry) => void; seedText?: string }) {
  const [title, setTitle] = useState("A moment worth keeping");
  const [body, setBody] = useState(seedText);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (!body.trim()) { setError("Tell Lumora a little about this moment first."); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, body, tags: ["reflection"], source: "conversation" }) });
      const data = await response.json() as { entry?: JournalEntry; error?: string };
      if (!response.ok || !data.entry) throw new Error(data.error ?? "Couldn’t save your reflection.");
      onSaved(data.entry); onClose(); setBody("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Couldn’t save your reflection."); }
    finally { setSaving(false); }
  };
  return <AnimatePresence>{open && <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}><motion.section role="dialog" aria-modal="true" aria-labelledby="journal-title" className="journal-sheet" initial={{ opacity: 0, y: 24, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .98 }} onMouseDown={(event) => event.stopPropagation()}><header><div><span className="eyebrow">A private moment</span><h2 id="journal-title">Turn this into a memory</h2></div><button className="icon-button" onClick={onClose} aria-label="Close journal"><X size={19}/></button></header><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120}/></label><label>Reflection<textarea autoFocus value={body} onChange={(event) => setBody(event.target.value)} placeholder="Tell Lumora what happened, in your own words…" rows={7} maxLength={10000}/></label>{error && <p className="form-error">{error}</p>}<footer><span>Lumora will privately detect the emotional tone.</span><button className="save-button" type="button" onClick={save} disabled={saving}>{saving ? <LoaderCircle className="spin" size={17}/> : <Check size={17}/>} {saving ? "Saving" : "Keep this memory"}</button></footer></motion.section></motion.div>}</AnimatePresence>;
}
