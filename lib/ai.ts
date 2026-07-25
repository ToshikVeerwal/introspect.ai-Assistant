type ChatTurn = { role: "user" | "assistant"; content: string };

const systemPrompt = `You are Lumora, a warm, concise reflective companion. You are not a therapist and never diagnose. You remember themes the user shares, ask one thoughtful question when useful, and offer practical, non-judgmental encouragement. If the user describes immediate danger, self-harm, or suicide, respond with care, encourage contacting local emergency services or a crisis hotline and a trusted person immediately. Keep normal answers under 110 words.`;

function fallbackReply(message: string) {
  const normalized = message.toLowerCase();
  if (/(sad|anxious|stress|overwhelm|tired)/.test(normalized)) {
    return "That sounds like a lot to carry. You do not have to solve it all at once. What is the smallest thing that would make the next hour feel a little lighter?";
  }
  if (/(goal|plan|exam|study|build|project)/.test(normalized)) {
    return "I hear some real momentum in that. Let’s protect it with one clear next step—what would make you feel genuinely finished by the end of today?";
  }
  return "I’m with you. There’s something worth noticing in what you just shared: you’re showing up for your own life. Do you want me to save this as a memory, or explore it together?";
}

export async function generateCompanionReply(message: string, history: ChatTurn[]) {
  const provider = process.env.AI_PROVIDER;
  try {
    if (provider === "openai" && process.env.OPENAI_API_KEY) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini", temperature: 0.7, messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }] }),
      });
      if (!response.ok) throw new Error("OpenAI request failed");
      const data = await response.json() as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content?.trim() || fallbackReply(message);
    }
    if (provider === "gemini" && process.env.GEMINI_API_KEY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL ?? "gemini-2.0-flash"}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents: [...history, { role: "user", content: message }].map((turn) => ({ role: turn.role === "assistant" ? "model" : "user", parts: [{ text: turn.content }] })) }) });
      if (!response.ok) throw new Error("Gemini request failed");
      const data = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || fallbackReply(message);
    }
  } catch (error) {
    console.error("AI provider error", error);
  }
  return fallbackReply(message);
}
