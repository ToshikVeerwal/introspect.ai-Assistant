import type { JournalEntry, Insight } from "@/lib/types";

export const demoEntries: JournalEntry[] = [
  { id: "entry-1", createdAt: "2026-07-25T09:20:00.000Z", title: "A quieter kind of confidence", body: "I shipped the first version of my assistant today. I was nervous before the demo, but the moment it worked I felt calm and capable.", mood: "joy", moodScore: 82, tags: ["building", "milestone"], source: "voice" },
  { id: "entry-2", createdAt: "2026-07-23T20:10:00.000Z", title: "Making room to breathe", body: "The exam work felt heavy, so I took a long walk without my phone. The pressure did not disappear, but I came back with a clearer plan.", mood: "calm", moodScore: 67, tags: ["exams", "walk"], source: "text" },
  { id: "entry-3", createdAt: "2026-07-21T23:48:00.000Z", title: "Too many tabs open", body: "I kept switching between tasks and felt restless. I want to try a smaller list tomorrow and stop studying past midnight.", mood: "anxious", moodScore: 42, tags: ["focus", "sleep"], source: "voice" },
];

export const demoInsights: Insight[] = [
  { label: "Your week", value: "More grounded", detail: "You mentioned calm or clarity 3 times after making space for yourself.", tone: "calm" },
  { label: "Momentum", value: "+18%", detail: "Your writing streak is the strongest it has been in six weeks.", tone: "joy" },
  { label: "Gentle nudge", value: "Sleep", detail: "Late-night work appeared in two recent reflections. A softer wind-down may help.", tone: "tender" },
];

export const weeklyMood = [
  { day: "Mon", value: 48 }, { day: "Tue", value: 58 }, { day: "Wed", value: 52 },
  { day: "Thu", value: 67 }, { day: "Fri", value: 82 }, { day: "Sat", value: 73 }, { day: "Sun", value: 78 },
];
