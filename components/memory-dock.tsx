"use client";

import { CalendarDays, ChevronRight, Heart, Search } from "lucide-react";
import type { JournalEntry } from "@/lib/types";

const tone: Record<string, string> = { joy: "joy", calm: "calm", focused: "focused", anxious: "anxious", tender: "tender", low: "low" };

export function MemoryDock({ entries, active, onOpenJournal, onOpenInsights }: { entries: JournalEntry[]; active: "journal" | "insights" | "memories" | null; onOpenJournal: () => void; onOpenInsights: () => void }) {
  return <aside className="memory-dock" aria-label="Lumora navigation">
    <div className="dock-top"><button className={`dock-action ${active === "journal" ? "active" : ""}`} onClick={onOpenJournal}><CalendarDays size={16}/><span>Reflect</span></button><button className={`dock-action ${active === "insights" ? "active" : ""}`} onClick={onOpenInsights}><Heart size={16}/><span>Insights</span></button><button className={`dock-action ${active === "memories" ? "active" : ""}`}><Search size={16}/><span>Recall</span></button></div>
    <div className="dock-memory"><div className="dock-label"><span>Recent memories</span><button aria-label="View all memories"><ChevronRight size={15}/></button></div>{entries.slice(0, 3).map((entry) => <article key={entry.id} className="mini-memory"><i className={tone[entry.mood]} /><div><strong>{entry.title}</strong><p>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(entry.createdAt))} · {entry.mood}</p></div></article>)}</div>
    <div className="streak-card"><span>Reflection rhythm</span><strong>12 <small>days</small></strong><p>Your kindest streak yet.</p><div><i/><i/><i/><i/><i/><i/><i/></div></div>
  </aside>;
}
