import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createHash } from "crypto";

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

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export const logAdminLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) return { ok: false };
    const { data: u } = await supabase.auth.getUser();
    await writeAudit({ actor_id: userId, actor_email: u.user?.email ?? null, action: "admin.login" });
    return { ok: true };
  });

export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabaseAdmin
      .from("audit_logs" as any).select("*").order("seq", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    return { logs: (data ?? []) as any[] };
  });

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
    await assertAdmin(supabase, userId);
    const { data: u } = await supabase.auth.getUser();
    if (data.grant) await supabaseAdmin.from("user_roles").insert({ user_id: data.target_user_id, role: data.role });
    else await supabaseAdmin.from("user_roles").delete().eq("user_id", data.target_user_id).eq("role", data.role);
    await writeAudit({
      actor_id: userId, actor_email: u.user?.email ?? null,
      action: data.grant ? "role.grant" : "role.revoke",
      target: data.target_user_id, details: { role: data.role },
    });
    return { ok: true };
  });

// Verify tamper-evident hash chain + flag suspicious time gaps
export const verifyAuditChain = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabaseAdmin
      .from("audit_logs" as any).select("*").order("seq", { ascending: true });
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as any[];
    const issues: { seq: number; type: string; message: string }[] = [];
    let prev = "GENESIS";
    let lastSeq = 0;
    let lastTime: number | null = null;
    for (const r of rows) {
      // sequence gap
      if (lastSeq && r.seq !== lastSeq + 1) {
        issues.push({ seq: r.seq, type: "missing_seq", message: `Sequence jumped from ${lastSeq} to ${r.seq} — entries deleted?` });
      }
      // recompute hash
      const payload = [r.seq, r.created_at, r.action,
        r.actor_id ?? "", r.actor_email ?? "", r.target ?? "",
        r.details ? JSON.stringify(r.details) : "", prev].join("|");
      const expected = createHash("sha256").update(payload).digest("hex");
      if (r.row_hash !== expected) {
        issues.push({ seq: r.seq, type: "hash_mismatch", message: "Row hash does not match — entry was modified." });
      }
      if (r.prev_hash !== prev) {
        issues.push({ seq: r.seq, type: "chain_broken", message: "Previous-hash link broken — chain tampered." });
      }
      // time gap > 30 days between consecutive entries is suspicious
      const t = new Date(r.created_at).getTime();
      if (lastTime && t - lastTime > 30 * 24 * 3600 * 1000) {
        issues.push({ seq: r.seq, type: "long_silence", message: "More than 30 days since previous entry." });
      }
      prev = r.row_hash;
      lastSeq = r.seq;
      lastTime = t;
    }
    return { total: rows.length, ok: issues.length === 0, issues };
  });

// Server-side CSV export with date filter — admin only
export const exportAuditLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    let q = supabaseAdmin.from("audit_logs" as any).select("*").order("seq", { ascending: true });
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const esc = (v: any) => {
      if (v === null || v === undefined) return "";
      const s = typeof v === "object" ? JSON.stringify(v) : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["seq","created_at","action","actor_email","actor_id","target","details","prev_hash","row_hash"];
    const lines = [header.join(",")];
    for (const r of (rows ?? []) as any[]) {
      lines.push(header.map(h => esc((r as any)[h])).join(","));
    }
    const { data: u } = await supabase.auth.getUser();
    await writeAudit({
      actor_id: userId, actor_email: u.user?.email ?? null,
      action: "audit.export",
      details: { from: data.from ?? null, to: data.to ?? null, rows: rows?.length ?? 0 },
    });
    return { csv: lines.join("\n"), rows: rows?.length ?? 0 };
  });

// Heuristic security alerts: rapid logins, unknown accounts, hash-chain gaps.
export const getSecurityAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabaseAdmin
      .from("audit_logs" as any).select("*").order("seq", { ascending: true });
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as any[];

    const alerts: { level: "high" | "medium" | "low"; type: string; message: string; at?: string }[] = [];

    // 1. Hash-chain & sequence gaps
    let prev = "GENESIS"; let lastSeq = 0;
    for (const r of rows) {
      if (lastSeq && r.seq !== lastSeq + 1) {
        alerts.push({ level: "high", type: "audit_gap",
          message: `Audit entries ${lastSeq + 1}..${r.seq - 1} are missing (possible deletion).`, at: r.created_at });
      }
      const payload = [r.seq, r.created_at, r.action, r.actor_id ?? "", r.actor_email ?? "",
        r.target ?? "", r.details ? JSON.stringify(r.details) : "", prev].join("|");
      const expected = createHash("sha256").update(payload).digest("hex");
      if (r.row_hash && r.row_hash !== expected) {
        alerts.push({ level: "high", type: "hash_mismatch",
          message: `Audit row #${r.seq} hash does not match — entry was modified.`, at: r.created_at });
      }
      prev = r.row_hash ?? prev;
      lastSeq = r.seq;
    }

    // 2. Suspicious login patterns — only "admin.login" rows
    const logins = rows.filter(r => r.action === "admin.login");
    const since = Date.now() - 24 * 3600 * 1000;
    const recent = logins.filter(l => new Date(l.created_at).getTime() > since);

    // Burst: 5+ logins from same actor in 10 minutes
    const byActor = new Map<string, any[]>();
    for (const l of logins) {
      const key = l.actor_email || l.actor_id || "unknown";
      if (!byActor.has(key)) byActor.set(key, []);
      byActor.get(key)!.push(l);
    }
    for (const [actor, list] of byActor) {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      for (let i = 4; i < list.length; i++) {
        const dt = new Date(list[i].created_at).getTime() - new Date(list[i - 4].created_at).getTime();
        if (dt < 10 * 60 * 1000) {
          alerts.push({ level: "high", type: "login_burst",
            message: `${actor} signed in 5+ times within 10 minutes — possible brute-force or token theft.`,
            at: list[i].created_at });
          break;
        }
      }
      // Off-hours (00:00–05:00 local server time)
      const offHours = list.filter(l => {
        const h = new Date(l.created_at).getUTCHours();
        return h >= 0 && h < 5;
      });
      if (offHours.length >= 2) {
        alerts.push({ level: "medium", type: "off_hours_login",
          message: `${actor} has ${offHours.length} sign-ins during off-hours (00:00–05:00 UTC).`,
          at: offHours[offHours.length - 1].created_at });
      }
    }

    if (recent.length >= 20) {
      alerts.push({ level: "medium", type: "high_volume",
        message: `${recent.length} admin sign-ins in the last 24h — unusually high.` });
    }

    return {
      total_logins: logins.length,
      logins_24h: recent.length,
      audit_entries: rows.length,
      alerts,
    };
  });
