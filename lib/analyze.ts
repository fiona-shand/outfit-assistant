import "server-only";
import { z } from "zod";
import { jpeg, structured } from "./claude";
import { CATEGORIES, SEASONS, type Item } from "./types";

export const DetectedItem = z.object({
  category: z.enum(CATEGORIES),
  match_item_id: z
    .string()
    .nullable()
    .describe("id of the existing wardrobe item this is, or null if it is not in the wardrobe"),
  match_confidence: z.number().describe("0 to 1; how sure you are about match_item_id"),
  name: z.string().describe("Short, specific name, e.g. 'Navy wool blazer'"),
  colors: z.array(z.string()),
  pattern: z.string().describe("e.g. solid, pinstripe, floral, check"),
  material: z.string().describe("best guess, e.g. cotton, wool, leather, denim"),
  formality: z.number().int().describe("1 = very casual … 5 = formal business"),
  warmth: z.number().int().describe("1 = very light/hot-weather … 5 = heavy/cold-weather"),
  seasons: z.array(z.enum(SEASONS)),
  description: z.string().describe("One sentence with distinguishing details (cut, fit, hardware, texture)"),
  bbox: z
    .object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() })
    .describe("Bounding box as fractions (0-1) of image width/height; x,y = top-left corner"),
});
export type DetectedItem = z.infer<typeof DetectedItem>;

const Analysis = z.object({
  items: z.array(DetectedItem),
  outfit_summary: z.string().describe("One sentence describing the overall look"),
});
export type Analysis = z.infer<typeof Analysis>;

const SYSTEM = `You catalog a person's work wardrobe from daily outfit photos.
For each photo, identify every visible garment and accessory they are wearing: top (shirt, blouse, knit, tee), bottom (trousers, skirt, jeans), dress/jumpsuit, shoes, outerwear (blazer, jacket, coat, cardigan worn as a layer), and accessories (bag, belt, jewellery, watch, scarf, glasses, hat).
Ignore anything not worn by the person (furniture, mirrors, other people). Skip items that are almost entirely hidden.

You also get the existing wardrobe as a list. Match a detected item to an existing id only when it is very likely the same physical piece (same category, colour, pattern and distinguishing details). Similar-but-different pieces (another white shirt with a different collar) are NOT matches - return null so a new item is created. Use match_confidence to express doubt; the person will review your matches.`;

export function wardrobeLine(i: Item): string {
  return `${i.id} | ${i.category} | ${i.name} | ${i.colors.join("/")} | ${i.pattern ?? ""} | ${i.description ?? ""}`;
}

export async function analyzeOutfit(photoBase64: string, wardrobe: Item[]): Promise<Analysis> {
  const list = wardrobe.filter((i) => i.active).map(wardrobeLine).join("\n");
  const result = await structured({
    schema: Analysis,
    system: SYSTEM,
    effort: "medium",
    content: [
      jpeg(photoBase64),
      {
        type: "text",
        text: `Existing wardrobe (id | category | name | colours | pattern | details):\n${list || "(empty - everything is new)"}\n\nCatalog the outfit in the photo.`,
      },
    ],
  });
  // Drop hallucinated ids so the review screen never points at a missing item.
  const ids = new Set(wardrobe.map((i) => i.id));
  for (const item of result.items) {
    if (item.match_item_id && !ids.has(item.match_item_id)) item.match_item_id = null;
    item.formality = clamp(item.formality, 1, 5);
    item.warmth = clamp(item.warmth, 1, 5);
  }
  return result;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, Math.round(n)));
}
