import { demoEntries } from "@/lib/demo-data";
import type { JournalEntry, Mood } from "@/lib/types";

const entries = [...demoEntries];

const moodFromText = (body: string): { mood: Mood; moodScore: number } => {
  const text = body.toLowerCase();
  if (/(happy|proud|excited|grateful|celebrat)/.test(text)) return { mood: "joy", moodScore: 82 };
  if (/(anxious|stress|worried|overwhelm|afraid)/.test(text)) return { mood: "anxious", moodScore: 44 };
  if (/(sad|lonely|hopeless|low)/.test(text)) return { mood: "low", moodScore: 36 };
  if (/(focus|study|build|work|plan)/.test(text)) return { mood: "focused", moodScore: 72 };
  return { mood: "calm", moodScore: 65 };
};

export function listEntries() { return [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

export function saveEntry(input: Pick<JournalEntry, "title" | "body" | "tags" | "source">) {
  const detected = moodFromText(input.body);
  const entry: JournalEntry = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...input, ...detected };
  entries.unshift(entry);
  return entry;
}
