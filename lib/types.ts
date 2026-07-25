export type Mood = "joy" | "calm" | "focused" | "anxious" | "tender" | "low";

export type JournalEntry = {
  id: string;
  createdAt: string;
  title: string;
  body: string;
  mood: Mood;
  moodScore: number;
  tags: string[];
  source: "voice" | "text" | "conversation";
};

export type Insight = {
  label: string;
  value: string;
  detail: string;
  tone: Mood;
};

export type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};
