import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const errorInput = z.object({
  event_type: z.enum(["stylesheet_transform", "app_error_boundary"]),
  message: z.string().trim().min(1).max(2000),
  stack: z.string().max(12000).optional(),
  component_stack: z.string().max(12000).optional(),
  pathname: z.string().startsWith("/").max(300),
  locale: z.enum(["en", "ta"]),
  user_agent: z.string().max(500).optional(),
});

export type ClientErrorInput = z.infer<typeof errorInput>;

export const reportClientError = createServerFn({ method: "POST" })
  .inputValidator((input) => errorInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const authorization = getRequestHeader("authorization");
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (authorization?.startsWith("Bearer ")) {
      const url = process.env["SUPABASE_URL"];
      const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
      if (url && key) {
        const authClient = createClient<Database>(url, key, {
          global: { headers: { Authorization: authorization } },
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });
        const { data: claims } = await authClient.auth.getClaims(authorization.slice(7));
        if (claims?.claims?.sub) {
          userId = claims.claims.sub;
          userEmail = typeof claims.claims.email === "string" ? claims.claims.email.slice(0, 320) : null;
        }
      }
    }

    const since = new Date(Date.now() - 60_000).toISOString();
    const { data: duplicate, error: duplicateError } = await supabaseAdmin
      .from("client_error_reports")
      .select("id")
      .eq("event_type", data.event_type)
      .eq("message", data.message)
      .eq("pathname", data.pathname)
      .gte("created_at", since)
      .limit(1)
      .maybeSingle();
    if (duplicateError) console.error("[client-errors] deduplication check failed", duplicateError);
    if (duplicate) return { ok: true, deduplicated: true };

    const { error } = await supabaseAdmin.from("client_error_reports").insert({
      event_type: data.event_type,
      message: data.message,
      stack: data.stack ?? null,
      component_stack: data.component_stack ?? null,
      pathname: data.pathname,
      locale: data.locale,
      user_agent: data.user_agent ?? null,
      user_id: userId,
      user_email: userEmail,
    });
    if (error) {
      console.error("[client-errors] report insert failed", error);
      return { ok: false };
    }
    return { ok: true, deduplicated: false };
  });

export const listClientErrorReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: role } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("client_error_reports")
      .select("id, event_type, message, stack, component_stack, pathname, locale, user_id, user_email, user_agent, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Could not load error reports");
    return { reports: data ?? [] };
  });