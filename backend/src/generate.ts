// src/generate.ts
import fetch from "node-fetch";

const CLAUDE_API = "https://api.anthropic.com/v1/messages";
const CLAUDE_KEY = process.env.CLAUDE_API_KEY || "";

if (!CLAUDE_KEY) {
  console.error("❌ Missing CLAUDE_API_KEY in environment!");
  process.exit(1);
}

export async function generateAndValidate(prompt: string) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n🤖 [Claude Attempt ${attempt}/${maxAttempts}] Generating...`);

    try {
      const res = await fetch(CLAUDE_API, {
        method: "POST",
        headers: {
          "x-api-key": CLAUDE_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 4096,
          temperature: 0.7,
          system: `You are ArjunAI, a full-stack web generator.
Return only full or partial HTML (no Markdown or code fences). 
Ensure <html>, <head>, and <body> exist.`,
          messages: [
            {
              role: "user",
              content: `Create a responsive website for the following prompt:
"${prompt}" — include HTML, CSS, and JavaScript inline. Output only HTML.`,
            },
          ],
        }),
      });

      const data = await res.json();
      const rawOutput = extractText(data);

      if (!rawOutput) throw new Error("Claude returned no usable text");

      let html = cleanHTML(rawOutput);

      // ✅ Auto-complete if truncated
      if (!html.endsWith("</html>")) {
        console.warn("⚠️ Claude output truncated, auto-completing HTML...");
        if (!html.includes("</body>")) html += "\n</body>";
        html += "\n</html>";
      }

      // ✅ Auto-insert doctype if missing
      if (!html.toLowerCase().startsWith("<!doctype")) {
        html = "<!DOCTYPE html>\n" + html;
      }

      console.log("✅ Returning usable HTML to frontend.");
      return { ok: true, html, model: "claude-3-7-sonnet-20250219", attempt };
    } catch (err) {
      console.error(`❌ Claude generation error (attempt ${attempt}):`, err);
    }
  }

  return { ok: false, error: "All attempts failed to produce usable HTML" };
}

// --- Utilities ---
function extractText(data: any): string {
  if (!data) return "";
  if (Array.isArray(data.content)) {
    return data.content
      .map((p: any) => p?.text || (Array.isArray(p?.content) ? p.content.map((x: any) => x.text || "").join("") : ""))
      .join("")
      .trim();
  }
  return data?.content?.text || "";
}

function cleanHTML(raw: string): string {
  return raw
    .replace(/```html/g, "")
    .replace(/```/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}
