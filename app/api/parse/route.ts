import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const YT_RE = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const TT_RE = /tiktok\.com\/@[\w.]+\/video\/\d+/;

/**
 * Validates URL to prevent SSRF attacks
 * Blocks localhost, private IP ranges, and cloud metadata endpoints
 */
function validateUrlForSSRF(urlString: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(urlString);

    // Only allow HTTP and HTTPS protocols
    if (!["http:", "https:"].includes(url.protocol)) {
      return { valid: false, error: "Only HTTP and HTTPS protocols are allowed" };
    }

    const hostname = url.hostname.toLowerCase();

    // Block localhost and loopback addresses
    const blockedHosts = [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "[::1]",
      "::1",
    ];

    if (blockedHosts.includes(hostname)) {
      return { valid: false, error: "Invalid URL: localhost not allowed" };
    }

    // Block cloud metadata endpoints
    if (hostname === "169.254.169.254" || hostname === "metadata.google.internal") {
      return { valid: false, error: "Invalid URL: metadata endpoints not allowed" };
    }

    // Block private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const [, a, b, c, d] = ipv4Match.map(Number);
      
      // Validate IP range
      if (a > 255 || b > 255 || c > 255 || d > 255) {
        return { valid: false, error: "Invalid IP address" };
      }

      // Block private ranges
      if (
        a === 10 || // 10.0.0.0/8
        (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
        (a === 192 && b === 168) || // 192.168.0.0/16
        a === 127 || // 127.0.0.0/8 (loopback)
        a === 0 // 0.0.0.0/8
      ) {
        return { valid: false, error: "Invalid URL: private IP ranges not allowed" };
      }
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: "Invalid URL format" };
  }
}

function decodeEscapedJsonString(value: string): string {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value;
  }
}

function extractYouTubeDescription(html: string): string {
  const shortDescMatch = html.match(/"shortDescription":"((?:\\.|[^"\\])*)"/);
  if (shortDescMatch?.[1]) {
    return decodeEscapedJsonString(shortDescMatch[1]).trim();
  }

  const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  if (ogDescMatch?.[1]) return ogDescMatch[1].trim();

  const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (metaDescMatch?.[1]) return metaDescMatch[1].trim();

  return "";
}

function normalizeToArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

function extractRecipeFromJsonLd(html: string): { title: string; description: string; ingredients: string[] } | null {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of scripts) {
    const raw = match[1]?.trim();
    if (!raw) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }

    const queue: unknown[] = normalizeToArray(parsed);
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || typeof current !== "object") continue;

      const obj = current as Record<string, unknown>;
      if (Array.isArray(obj["@graph"])) {
        queue.push(...obj["@graph"]);
      }

      const typeValue = obj["@type"];
      const types = normalizeToArray(typeValue)
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.toLowerCase());

      if (!types.includes("recipe")) continue;

      const ingredients = normalizeToArray(obj.recipeIngredient)
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim())
        .filter(Boolean);

      return {
        title: typeof obj.name === "string" ? obj.name.trim() : "",
        description: typeof obj.description === "string" ? obj.description.trim() : "",
        ingredients,
      };
    }
  }

  return null;
}

// Fetch title + description from a URL using oEmbed (YouTube/TikTok) or meta tags
async function fetchUrlMetadata(url: string): Promise<{ title: string; description: string }> {
  // Validate URL to prevent SSRF attacks
  const validation = validateUrlForSSRF(url);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid URL");
  }

  try {
    if (YT_RE.test(url)) {
      let title = "";
      let description = "";

      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const data = await res.json();
        title = (data.title ?? "").trim();
        description = `Video de YouTube por ${data.author_name ?? ""}`.trim();
      }

      const pageRes = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Menubelo/1.0)" },
        signal: AbortSignal.timeout(10000),
      });

      if (pageRes.ok) {
        const html = await pageRes.text();
        const pageTitleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const ytDescription = extractYouTubeDescription(html);

        if (!title) {
          title = (pageTitleMatch?.[1] ?? "").replace(/-\s*YouTube\s*$/i, "").trim();
        }
        if (ytDescription.length > description.length) {
          description = ytDescription;
        }
      }

      if (title || description) {
        return { title, description };
      }
    }

    if (TT_RE.test(url)) {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const data = await res.json();
        return { title: data.title ?? "", description: `Video de TikTok por ${data.author_name ?? ""}` };
      }
    }

    // Generic: fetch page and extract Recipe JSON-LD or meta tags
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Menubelo/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();

    const recipe = extractRecipeFromJsonLd(html);
    if (recipe) {
      const ingredientsBlock = recipe.ingredients.length
        ? `\nIngredientes:\n${recipe.ingredients.map((i) => `- ${i}`).join("\n")}`
        : "";

      return {
        title: recipe.title,
        description: `${recipe.description}${ingredientsBlock}`.trim(),
      };
    }

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

    return {
      title: (ogTitleMatch?.[1] ?? titleMatch?.[1] ?? "").trim(),
      description: (ogDescMatch?.[1] ?? metaDescMatch?.[1] ?? "").trim(),
    };
  } catch {
    return { title: url, description: "" };
  }
}

// Simple regex-based parser used as fallback when Claude is unavailable
function regexParse(text: string) {
  // Match: (optional qty)(optional unit)(ingredient name) — handles "200g patatas", "3 huevos", "2 tazas harina"
  const LINE_RE = /^([\d.,½⅓⅔¼¾/]+)?\s*(g|ml|kg|l|tazas?|cucharadas?|cucharaditas?|unidades?|dientes?|ramitas?|tiras?|al gusto|puñado)?\s*(.+)$/i;

  function toNum(raw: string): number | null {
    const s = raw.replace(",", ".").replace("½","0.5").replace("⅓","0.33").replace("⅔","0.67").replace("¼","0.25").replace("¾","0.75");
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  const allLines = text
    .split("\n")
    .map((l) => l.replace(/^[-*•·\d.]+\s*/, "").trim())
    .filter((l) => l.length > 2);

  const ingredientHeaderRe = /(ingredientes?|ingredients?)\b/i;
  const stopSectionRe = /(preparaci[oó]n|instrucciones?|steps?|method|directions?|suscr|subscribe|follow|playlist|lyrics?)\b/i;
  const noiseRe = /(https?:\/\/|www\.|@\w+|#\w+|facebook|instagram|spotify|tiktok|twitter|subscribe|follow)/i;

  // Prefer lines inside an explicit ingredients section when available.
  const ingredientHeaderIdx = allLines.findIndex((l) => ingredientHeaderRe.test(l));
  const sectionLines: string[] = [];
  if (ingredientHeaderIdx >= 0) {
    for (let i = ingredientHeaderIdx + 1; i < allLines.length && sectionLines.length < 40; i += 1) {
      const line = allLines[i];
      if (stopSectionRe.test(line)) break;
      if (noiseRe.test(line)) continue;
      sectionLines.push(line);
    }
  }

  // Detect name: first short non-ingredient-looking line
  const firstLine = allLines[0] ?? "";
  const isUrl = /^https?:/.test(firstLine);
  const looksLikeName = !isUrl && firstLine.length < 80 && !/^\d/.test(firstLine);
  const recipeName = looksLikeName ? firstLine : "Mi receta";
  const baseLines = looksLikeName ? allLines.slice(1) : allLines;
  const ingredientLines = (sectionLines.length > 0 ? sectionLines : baseLines)
    .filter((line) => !noiseRe.test(line))
    .filter((line) => line.length <= 120 || /\d|g\b|kg\b|ml\b|taza|cucharada|unidad|diente|ramita/i.test(line));

  const measuredLineRe = /(^|\s)\d+[\d.,/]*\s*(g|kg|ml|l|taza|tazas|cucharada|cucharadas|cucharadita|cucharaditas|unidad|unidades|diente|dientes|ramita|ramitas)\b/i;
  const hasMeasuredLines = ingredientLines.some((line) => measuredLineRe.test(line));
  const hasIngredientSection = sectionLines.length > 0;
  const linesToParse = hasIngredientSection || hasMeasuredLines ? ingredientLines : [];

  const ingredients = linesToParse.slice(0, 30).map((line) => {
    const match = line.match(LINE_RE);
    if (!match) return { name: line.toLowerCase(), quantity: null, unit: null, notes: null, category: "otros" };
    const [, rawQty, unit, name] = match;
    const qty = rawQty ? toNum(rawQty) : null;
    return {
      name: name.trim().toLowerCase(),
      quantity: qty,
      unit: unit?.toLowerCase() ?? null,
      notes: null,
      category: "otros",
    };
  }).filter((i) => i.name.length > 1);

  return {
    name: recipeName,
    description: "",
    servings: 2,
    prepTimeMin: null,
    cookTimeMin: null,
    ingredients,
  };
}

const PARSE_SYSTEM = `Eres un asistente experto en recetas de cocina.
Cuando recibas texto de una receta (o título/descripción de un video), extrae los datos estructurados y devuelve SOLO un JSON válido con este esquema exacto, sin texto adicional:

{
  "name": "string",
  "description": "string (1-2 oraciones)",
  "servings": number,
  "prepTimeMin": number | null,
  "cookTimeMin": number | null,
  "ingredients": [
    {
      "name": "string (nombre canónico del ingrediente, minúsculas)",
      "quantity": number,
      "unit": "string (g, ml, kg, l, taza, cucharada, cucharadita, unidad, diente, ramita, al gusto, etc.)",
      "notes": "string | null (ej: 'picado fino', 'a temperatura ambiente')",
      "category": "string (pasta y cereales | legumbres | carnes y aves | carnes y embutidos | pescados y mariscos | lácteos | huevos | verduras y hortalizas | frutas | hierbas y especias | condimentos | aceites y grasas | conservas | caldos y sopas | endulzantes | panadería | bebidas | otros)"
    }
  ]
}

Si no puedes determinar un campo numérico, usa null. El JSON debe ser parseable directamente.`;

// POST /api/parse
// Body: { text?: string, url?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, url } = body as { text?: string; url?: string };

    if (!text && !url) {
      return NextResponse.json({ error: "text or url is required" }, { status: 400 });
    }

    let content = text ?? "";

    // If URL provided, fetch metadata and build content string
    if (url) {
      const meta = await fetchUrlMetadata(url);
      content = `URL: ${url}\nTítulo: ${meta.title}\nDescripción: ${meta.description}${text ? `\n\nTexto adicional:\n${text}` : ""}`;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Regex fallback: basic ingredient parser when AI is unavailable
      const fallback = regexParse(content);
      return NextResponse.json(fallback);
    }

    try {
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: PARSE_SYSTEM,
        messages: [{ role: "user", content: `Extrae la receta de este contenido:\n\n${content}` }],
      });

      const rawText = message.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("");

      // Strip markdown code fences if present
      const jsonText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        return NextResponse.json({ error: "Failed to parse AI response", raw: rawText }, { status: 422 });
      }

      return NextResponse.json(parsed);
    } catch (aiErr) {
      console.warn("[POST /api/parse] AI provider failed, using regex fallback", aiErr);
      const fallback = regexParse(content);
      return NextResponse.json(fallback);
    }
  } catch (err) {
    console.error("[POST /api/parse]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
