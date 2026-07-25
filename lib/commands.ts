export type VoiceCommand = { label: string; response: string; panel?: "journal" | "insights" | "memories" };

export function parseVoiceCommand(transcript: string): VoiceCommand | null {
  const text = transcript.toLowerCase();
  if (/(today.?s journal|new journal|open journal)/.test(text)) return { label: "Journal opened", response: "I’ve opened a fresh page for today. Tell me what’s on your mind.", panel: "journal" };
  if (/(mood|insight|how have i been feeling|graph)/.test(text)) return { label: "Insights opened", response: "Here’s the emotional pattern I’ve been noticing this week.", panel: "insights" };
  if (/(memory|memories|search)/.test(text)) return { label: "Memories opened", response: "I’m bringing your recent memories closer.", panel: "memories" };
  return null;
}
