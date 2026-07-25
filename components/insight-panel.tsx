"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { Insight } from "@/lib/types";

const tones = { joy: "gold", calm: "cyan", focused: "cyan", anxious: "violet", tender: "violet", low: "violet" } as const;

export function InsightPanel({ insights, mood }: { insights: Insight[]; mood: { day: string; value: number }[] }) {
  return <section className="panel insights-panel" aria-label="Weekly life insights">
    <div className="panel-heading"><div><span className="eyebrow"><Sparkles size={13}/> Life signal</span><h2>How your week feels</h2></div><button className="quiet-button" type="button">View report <ArrowUpRight size={15}/></button></div>
    <div className="mood-chart" aria-label="Mood trend from Monday to Sunday">
      <ResponsiveContainer width="100%" height="100%"><AreaChart data={mood} margin={{ top: 12, right: 0, left: 0, bottom: 0 }}><defs><linearGradient id="moodFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#67e8f9" stopOpacity=".45"/><stop offset="100%" stopColor="#67e8f9" stopOpacity="0"/></linearGradient></defs><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#978eae", fontSize: 10 }} dy={8}/><Tooltip cursor={false} contentStyle={{ background: "#171024", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, color: "#f8f7ff", fontSize: 12 }}/><Area type="monotone" dataKey="value" stroke="#8bf4ff" strokeWidth={2} fill="url(#moodFill)" /></AreaChart></ResponsiveContainer>
    </div>
    <div className="signal-stack">{insights.map((insight) => <article className="signal" key={insight.label}><i className={tones[insight.tone]} /><div><span>{insight.label}</span><strong>{insight.value}</strong><p>{insight.detail}</p></div></article>)}</div>
  </section>;
}
