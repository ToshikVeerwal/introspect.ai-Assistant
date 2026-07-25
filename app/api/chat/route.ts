import { generateCompanionReply } from "@/lib/ai";
import { z } from "zod";

const schema = z.object({ message: z.string().trim().min(1).max(3000), history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(3000) })).max(12).default([]) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Please send a valid message." }, { status: 400 });
  const reply = await generateCompanionReply(parsed.data.message, parsed.data.history);
  return Response.json({ reply });
}
