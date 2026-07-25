import { demoInsights, weeklyMood } from "@/lib/demo-data";

export function GET() { return Response.json({ insights: demoInsights, weeklyMood }); }
