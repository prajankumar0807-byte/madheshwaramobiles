import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Public: look up a repair by job code OR phone number
export const lookupRepair = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      query: z.string().trim().min(3).max(40),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const q = data.query;
    const { data: rows, error } = await supabaseAdmin
      .from("repair_jobs")
      .select("job_code, customer_name, device, issue, status, estimated_ready_at, updated_at")
      .or(`job_code.eq.${q},phone.eq.${q}`)
      .order("updated_at", { ascending: false })
      .limit(5);
    if (error) return { jobs: [], error: error.message };
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
    if (error) return { ok: false, error: error.message };
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
