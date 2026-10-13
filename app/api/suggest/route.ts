import { route } from "@/lib/http";
import { generateSuggestion } from "@/lib/suggest";

export const maxDuration = 120;

/** Generate (or reshuffle) today's suggestion. Body: { avoid?: string[] } */
export const POST = route(async (req: Request) => {
  const body = await req.json().catch(() => ({}));
  const avoid = Array.isArray(body.avoid) ? body.avoid.map(String) : undefined;
  return generateSuggestion({ avoid });
});
