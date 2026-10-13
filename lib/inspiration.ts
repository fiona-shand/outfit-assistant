import "server-only";
import { jpeg, text } from "./claude";

export async function summarizeInspiration(photoBase64: string): Promise<string> {
  return text({
    system:
      "You are a personal stylist studying a client's inspiration photos for their work wardrobe. Be concrete and concise.",
    effort: "low",
    content: [
      jpeg(photoBase64),
      {
        type: "text",
        text: "In 3-5 short bullet points, describe what makes this look work: colour palette, silhouettes and proportions, layering, formality, shoes and accessories, and any pairing rule worth copying.",
      },
    ],
  });
}

export async function buildStyleProfile(summaries: string[]): Promise<string> {
  return text({
    system:
      "You are a personal stylist writing a reusable style brief that will guide daily outfit suggestions.",
    effort: "medium",
    content: [
      {
        type: "text",
        text: `Here are notes on ${summaries.length} inspiration photos the client chose:\n\n${summaries
          .map((s, i) => `Photo ${i + 1}:\n${s}`)
          .join("\n\n")}\n\nDistil these into one style profile (max ~250 words) with short sections: Signature palette, Silhouettes & fit, Formality range, Pairing rules, Shoes & accessories, Avoid. Focus on patterns that recur across photos. Plain text with simple "-" bullets, no markdown headings symbols.`,
      },
    ],
  });
}
