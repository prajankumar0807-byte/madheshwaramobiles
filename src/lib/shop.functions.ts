import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { writeAudit } from "@/lib/audit.functions";


// Public: look up a repair by job code OR phone number.
// SECURITY: Strictly whitelist input characters to prevent PostgREST .or() filter
// injection, and only return non-PII status fields to unauthenticated callers.
export const lookupRepair = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      // Allow only safe characters — no commas, dots, parens, or PostgREST operators.
      query: z
        .string()
        .trim()
        .min(3)
        .max(40)
        .regex(/^[A-Za-z0-9+\-\s]+$/, "Use letters, numbers, + or - only."),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const q = data.query;
    // Build the filter with two separate, fully-sanitized equality checks.
    // We use parameterized .or() with the sanitized value (no special chars
    // possible after the regex above), so injection is not possible.
    const { data: rows, error } = await supabaseAdmin
      .from("repair_jobs")
      .select("job_code, status, estimated_ready_at, updated_at")
      .or(`job_code.eq.${q},phone.eq.${q}`)
      .order("updated_at", { ascending: false })
      .limit(5);
    if (error) return { jobs: [], error: "Lookup failed. Please try again." };
    return { jobs: rows ?? [], error: null };
  });

// Public: submit feedback (private, only admins read it)
export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      name: z.string().trim().max(80).optional(),
      phone: z.string().trim().max(20).optional(),
      rating: z.number().int().min(1).max(5),
      message: z.string().trim().min(3).max(1000),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    // naive sentiment from rating + keywords
    const lower = data.message.toLowerCase();
    const negKeys = ["bad", "worst", "slow", "rude", "broken", "delay", "cheat"];
    let sentiment: "positive" | "neutral" | "negative" =
      data.rating >= 4 ? "positive" : data.rating === 3 ? "neutral" : "negative";
    if (negKeys.some((k) => lower.includes(k))) sentiment = "negative";

    const { error } = await supabaseAdmin.from("feedback").insert({
      name: data.name || null,
      phone: data.phone || null,
      rating: data.rating,
      message: data.message,
      sentiment,
    });
    if (error) {
      console.error("[feedback] insert error", error);
      return { ok: false, error: "Could not submit feedback. Please try again." };
    }
    return { ok: true };
  });

// Admin: create repair job
export const createRepair = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      customer_name: z.string().trim().min(1).max(80),
      phone: z.string().trim().min(6).max(20),
      device: z.string().trim().min(1).max(80),
      issue: z.string().trim().max(500).optional(),
      status: z.string().trim().max(40).default("Received"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Forbidden");
    const job_code = "SMM" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const { data: row, error } = await supabaseAdmin
      .from("repair_jobs")
      .insert({ ...data, job_code })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { job: row };
  });

// Admin: update repair status
export const updateRepair = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      status: z.string().trim().min(1).max(40),
      notes: z.string().trim().max(500).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Forbidden");
    const { error } = await supabaseAdmin
      .from("repair_jobs")
      .update({ status: data.status, notes: data.notes ?? null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Admin: list all repairs
export const listRepairs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Forbidden");
    const { data, error } = await supabaseAdmin
      .from("repair_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { jobs: data ?? [] };
  });

// Admin: list feedback
export const listFeedback = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Forbidden");
    const { data, error } = await supabaseAdmin
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { feedback: data ?? [] };
  });

// Check if current user is admin
export const checkAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    return { isAdmin: !!data };
  });

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}

// Admin: list all offers (active + inactive)
export const listOffers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabaseAdmin
      .from("offers").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return { offers: data ?? [] };
  });

// Admin: create new offer announcement
export const createOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      title: z.string().trim().min(2).max(80),
      description: z.string().trim().min(2).max(300),
      badge: z.string().trim().min(1).max(20).regex(/^[A-Za-z0-9 %+\-!#]+$/, "Badge: letters, numbers, % + - ! # only").optional(),
      expires_at: z.string().datetime().refine((v) => new Date(v) > new Date(), "Expiry must be in the future").optional(),
      image_url: z.string().url().max(500).optional(),
      active: z.boolean().default(true),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: row, error } = await supabaseAdmin
      .from("offers")
      .insert({
        title: data.title,
        description: data.description,
        badge: data.badge || null,
        expires_at: data.expires_at || null,
        image_url: data.image_url || null,
        active: data.active,
      })
      .select().single();
    if (error) throw new Error(error.message);
    const { data: u } = await supabase.auth.getUser();
    await writeAudit({
      actor_id: userId, actor_email: u.user?.email ?? null,
      action: "offer.create", target: (row as any)?.id ?? null,
      details: { title: data.title, badge: data.badge ?? null, active: data.active, has_image: !!data.image_url },
    });
    return { offer: row };
  });


// Admin: upload offer image and return a long-lived signed URL
export const uploadOfferImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      filename: z.string().min(1).max(120).regex(/^[A-Za-z0-9._-]+$/, "Invalid filename"),
      content_type: z.enum(["image/png", "image/jpeg", "image/webp", "image/gif"]),
      data_base64: z.string().min(10).max(8_000_000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const bytes = Buffer.from(data.data_base64, "base64");
    if (bytes.byteLength > 5 * 1024 * 1024) throw new Error("Image too large (max 5MB)");
    const ext = (data.filename.split(".").pop() || "bin").toLowerCase();
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabaseAdmin.storage.from("offer-images")
      .upload(key, bytes, { contentType: data.content_type, upsert: false });
    if (upErr) throw new Error(upErr.message);
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("offer-images").createSignedUrl(key, 60 * 60 * 24 * 365 * 10);
    if (signErr || !signed) throw new Error(signErr?.message ?? "Could not create URL");
    return { url: signed.signedUrl };
  });

// Admin: toggle active state
export const toggleOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabaseAdmin.from("offers").update({ active: data.active }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Admin: delete offer
export const deleteOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabaseAdmin.from("offers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
