import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Internal helper — call from server fns only.
export async function writeAudit(opts: {
  actor_id?: string | null;
  actor_email?: string | null;
  action: string;
  target?: string | null;
  details?: Record<string, unknown> | null;
}) {
  try {
    await supabaseAdmin.from("audit_logs" as any).insert({
      actor_id: opts.actor_id ?? null,
      actor_email: opts.actor_email ?? null,
      action: opts.action,
      target: opts.target ?? null,
      details: opts.details ?? null,
    });
  } catch (e) {
    console.error("[audit] failed", e);
  }
}

// Public server fn called by client right after a successful sign-in.
export const logAdminLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) return { ok: false };
    const { data: u } = await supabase.auth.getUser();
    await writeAudit({
      actor_id: userId,
      actor_email: u.user?.email ?? null,
      action: "admin.login",
    });
    return { ok: true };
  });

export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Forbidden");
    const { data, error } = await supabaseAdmin
      .from("audit_logs" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { logs: (data ?? []) as any[] };
  });

// Admin: change another user's role (records audit entry)
export const changeUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      target_user_id: z.string().uuid(),
      role: z.enum(["admin", "user"]),
      grant: z.boolean(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Forbidden");
    const { data: u } = await supabase.auth.getUser();
    if (data.grant) {
      await supabaseAdmin.from("user_roles").insert({ user_id: data.target_user_id, role: data.role });
    } else {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.target_user_id).eq("role", data.role);
    }
    await writeAudit({
      actor_id: userId,
      actor_email: u.user?.email ?? null,
      action: data.grant ? "role.grant" : "role.revoke",
      target: data.target_user_id,
      details: { role: data.role },
    });
    return { ok: true };
  });
