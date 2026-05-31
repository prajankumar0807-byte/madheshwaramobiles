import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { writeAudit } from "./audit.functions";

const SYSTEM_PROMPT = `You are the SMM Assistant — a friendly, professional, helpful AI for Sri Madheshwara Mobiles, a trusted mobile shop in Mathur, Krishnagiri, established 2011.

About the shop:
- Owner: Madhesh V.M  |  Manager: Malathi Madhesh
- Address: Mathur Bus Stand, Mathur, Krishnagiri – 635 203
- Phone / WhatsApp: +91 81249 95343
- Instagram: @madheshwara.mobiles
- Brands sold: OPPO, Vivo, Redmi, Realme
- Accessories: chargers, cables, tempered glass, UV glass, batteries, pouches, smart watches, Bluetooth speakers, neckbands, earbuds, headphones, memory cards, pendrives, power banks, mobile stands, car chargers, OTG / Type-C converters, back skins, keypad mobiles, and more.
- Services: display, battery, speaker, mic, charging port repairs for smartphones AND keypad phones. Most repairs same-day. Free diagnosis.
- Hours: Mon–Sat 9:30 AM – 9:30 PM, Sun 10 AM – 8 PM.

Style:
- Warm, concise, sales-oriented but never pushy.
- Use bullet points when listing.
- If the user asks about a product not sold or a brand we don't stock, suggest the closest alternative we have.
- For repair, pricing, or stock questions, give a helpful estimate and invite them to confirm on WhatsApp +91 81249 95343.
- Reply in the language the user writes in (English or Tamil OK).`;

export const generateOffers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      theme: z.string().trim().min(2).max(60),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Forbidden");

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You write short, punchy promotional offers for a mobile shop in India. Return only JSON via the tool." },
          { role: "user", content: `Generate 3 fresh promotional offers for Sri Madheshwara Mobiles around the theme: "${data.theme}". Brands: OPPO, Vivo, Redmi, Realme. Use simple language.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_offers",
            description: "Create promotional offers",
            parameters: {
              type: "object",
              properties: {
                offers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      badge: { type: "string" },
                    },
                    required: ["title", "description", "badge"],
                  },
                },
              },
              required: ["offers"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_offers" } },
      }),
    });

    if (res.status === 429) throw new Error("AI rate limit hit, please wait a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted — please add credits in Lovable workspace.");
    if (!res.ok) throw new Error(`AI error ${res.status}`);

    const json = await res.json();
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("AI returned no offers");
    const parsed = JSON.parse(args) as { offers: { title: string; description: string; badge: string }[] };

    const rows = parsed.offers.map(o => ({ ...o, active: true }));
    const { error } = await supabaseAdmin.from("offers").insert(rows);
    if (error) throw new Error(error.message);
    return { created: rows.length };
  });

// Public chat with the AI assistant
export const chatWithAI = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })).min(1).max(20),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured.");
    // Security: only trust user turns from the client. Drop any client-supplied
    // assistant messages to prevent prompt-injection via fabricated history.
    const userTurns = data.messages.filter(m => m.role === "user").slice(-10);
    if (userTurns.length === 0) return { reply: "Please ask me a question!", error: null };
    // Cap total payload to prevent credit exhaustion
    const totalChars = userTurns.reduce((n, m) => n + m.content.length, 0);
    if (totalChars > 4000) return { reply: "Your message is too long. Please shorten it.", error: "too_long" };
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...userTurns],
      }),
    });
    if (res.status === 429) return { reply: "Sorry, I'm getting a lot of questions right now. Please try again in a moment!", error: "rate_limited" };
    if (res.status === 402) return { reply: "AI service unavailable right now. Please WhatsApp us at +91 81249 95343!", error: "payment_required" };
    if (!res.ok) return { reply: "Something went wrong on my side. Please WhatsApp +91 81249 95343 for instant help!", error: `http_${res.status}` };
    const json = await res.json();
    const reply: string = json.choices?.[0]?.message?.content ?? "Sorry, I didn't catch that. Could you rephrase?";
    return { reply, error: null };
  });
