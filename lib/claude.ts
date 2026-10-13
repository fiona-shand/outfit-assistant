import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";

export const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export function hasClaude(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export function jpeg(base64: string): Anthropic.Beta.BetaImageBlockParam {
  return { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } };
}

/**
 * One Claude call that returns JSON validated against `schema`.
 * Uses server-side fallbacks so a rare safety decline is retried on another model.
 */
export async function structured<S extends z.ZodType>(opts: {
  schema: S;
  system: string;
  content: Anthropic.Beta.BetaContentBlockParam[];
  effort?: "low" | "medium" | "high";
}): Promise<z.infer<S>> {
  const response = await anthropic().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: opts.system,
    output_config: {
      effort: opts.effort ?? "medium",
      format: betaZodOutputFormat(opts.schema),
    },
    messages: [{ role: "user", content: opts.content }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude declined this request");
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("Claude's response was cut off");
  }
  if (response.parsed_output == null) {
    throw new Error("Claude returned output that didn't match the expected format");
  }
  return response.parsed_output as z.infer<S>;
}

export async function text(opts: {
  system: string;
  content: Anthropic.Beta.BetaContentBlockParam[];
  effort?: "low" | "medium" | "high";
}): Promise<string> {
  const response = await anthropic().beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: opts.system,
    output_config: { effort: opts.effort ?? "medium" },
    messages: [{ role: "user", content: opts.content }],
  });
  if (response.stop_reason === "refusal") throw new Error("Claude declined this request");
  return response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
