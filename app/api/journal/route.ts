import { listEntries, saveEntry } from "@/lib/journal-store";
import { z } from "zod";

const schema = z.object({ title: z.string().trim().min(1).max(120), body: z.string().trim().min(1).max(10000), tags: z.array(z.string().trim().min(1).max(30)).max(8).default([]), source: z.enum(["voice", "text", "conversation"]).default("text") });

export function GET() { return Response.json({ entries: listEntries() }); }

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Please add a title and a reflection." }, { status: 400 });
  return Response.json({ entry: saveEntry(parsed.data) }, { status: 201 });
}
