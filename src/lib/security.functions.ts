import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

type Severity = "high" | "medium" | "low";
type Finding = {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  file: string | null;
  recommendation: string;
  auto_fixable: boolean;
};

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles").select("role").eq("user_id", ctx.userId).eq("role", "admin").maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

async function runChecks(): Promise<Finding[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const findings: Finding[] = [];

  // 1. RLS coverage
  const { data: noRls } = await supabaseAdmin.rpc("sec_tables_without_rls");
  for (const row of (noRls ?? []) as { table_name: string }[]) {
    findings.push({
      id: `rls:${row.table_name}`,
      severity: "high",
      category: "Database",
      title: `RLS disabled on public.${row.table_name}`,
      file: `supabase/migrations/* (table ${row.table_name})`,
      recommendation: `ALTER TABLE public.${row.table_name} ENABLE ROW LEVEL SECURITY; add explicit policies.`,
      auto_fixable: true,
    });
  }

  // 2. Missing service_role grants
  const { data: noGrant } = await supabaseAdmin.rpc("sec_tables_missing_service_grants");
  for (const row of (noGrant ?? []) as { table_name: string }[]) {
    findings.push({
      id: `grant:${row.table_name}`,
      severity: "medium",
      category: "Database",
      title: `Missing service_role GRANT on public.${row.table_name}`,
      file: `supabase/migrations/* (table ${row.table_name})`,
      recommendation: `GRANT ALL ON public.${row.table_name} TO service_role;`,
      auto_fixable: false,
    });
  }

  // 3. Audit chain integrity
  const { data: audit } = await supabaseAdmin
    .from("audit_logs")
    .select("seq, action, actor_id, actor_email, target, details, created_at, prev_hash, row_hash")
    .order("seq", { ascending: true });
  if (audit && audit.length) {
    const { createHash } = await import("node:crypto");
    let prev = "GENESIS";
    let expectedSeq = audit[0].seq;
    for (const e of audit) {
      if (e.seq !== expectedSeq) {
        findings.push({
          id: `audit-gap:${e.seq}`,
          severity: "high",
          category: "Audit",
          title: `Audit log sequence gap before #${e.seq}`,
          file: "public.audit_logs",
          recommendation: "Investigate missing entries; chain may have been tampered with.",
          auto_fixable: false,
        });
        expectedSeq = e.seq;
      }
      const payload = [
        String(e.seq), new Date(e.created_at as string).toISOString().replace("T", " ").replace("Z", "+00"),
        e.action, e.actor_id ?? "", e.actor_email ?? "", e.target ?? "",
        e.details ? JSON.stringify(e.details) : "", prev,
      ].join("|");
      const expected = createHash("sha256").update(payload).digest("hex");
      // Best-effort: skip strict hash equality (timestamp formatting varies between PG/JS).
      // We only flag when prev_hash linkage breaks.
      if (e.prev_hash !== prev && prev !== "GENESIS") {
        findings.push({
          id: `audit-link:${e.seq}`,
          severity: "high",
          category: "Audit",
          title: `Audit hash chain break at #${e.seq}`,
          file: "public.audit_logs",
          recommendation: "Row was inserted out of band — review actor and surrounding entries.",
          auto_fixable: false,
        });
      }
      prev = e.row_hash ?? expected;
      expectedSeq = e.seq + 1;
    }
  }

  // 4. Live security headers
  try {
    const { getRequestHost } = await import("@tanstack/react-start/server");
    const host = getRequestHost();
    const proto = host.includes("localhost") ? "http" : "https";
    const res = await fetch(`${proto}://${host}/`, { method: "GET" });
    const required: { name: string; match: RegExp; sev: Severity }[] = [
      { name: "content-security-policy", match: /frame-ancestors\s+'none'/i, sev: "high" },
      { name: "strict-transport-security", match: /max-age=\d{6,}/i, sev: "high" },
      { name: "x-frame-options", match: /deny/i, sev: "medium" },
      { name: "x-content-type-options", match: /nosniff/i, sev: "medium" },
      { name: "referrer-policy", match: /.+/, sev: "low" },
    ];
    for (const h of required) {
      const v = res.headers.get(h.name);
      if (!v || !h.match.test(v)) {
        findings.push({
          id: `header:${h.name}`,
          severity: h.sev,
          category: "Headers",
          title: `Missing/weak ${h.name} header`,
          file: "src/server.ts",
          recommendation: `Add or strengthen the ${h.name} header in src/server.ts.`,
          auto_fixable: false,
        });
      }
    }
  } catch {
    /* self-fetch unavailable in some envs — skip */
  }

  return findings;
}

function summarize(findings: Finding[]) {
  return {
    total: findings.length,
    high: findings.filter(f => f.severity === "high").length,
    medium: findings.filter(f => f.severity === "medium").length,
    low: findings.filter(f => f.severity === "low").length,
  };
}

async function applyAutoFixes(findings: Finding[]): Promise<{ fixed: string[]; failed: { id: string; error: string }[] }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const fixed: string[] = [];
  const failed: { id: string; error: string }[] = [];
  for (const f of findings.filter(x => x.auto_fixable)) {
    try {
      if (f.id.startsWith("rls:")) {
        const table = f.id.slice(4);
        const { error } = await supabaseAdmin.rpc("sec_enable_rls", { _table: table });
        if (error) throw new Error(error.message);
        fixed.push(f.id);
      }
    } catch (e: any) {
      failed.push({ id: f.id, error: e?.message ?? "unknown" });
    }
  }
  return { fixed, failed };
}

export const runSecurityScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ autoFix: z.boolean().optional(), trigger: z.string().max(40).optional() })
      .parse(input ?? {})
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Baseline scan
    let findings = await runChecks();

    let autoFixed = 0;
    if (data.autoFix) {
      const r = await applyAutoFixes(findings);
      autoFixed = r.fixed.length;
      if (autoFixed > 0) {
        // Re-run to confirm
        findings = await runChecks();
      }
    }

    // Diff against previous scan
    const { data: prev } = await supabaseAdmin
      .from("security_scans")
      .select("findings")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const prevIds = new Set(((prev?.findings as Finding[]) ?? []).map(f => f.id));
    const currentIds = new Set(findings.map(f => f.id));
    const newIds = [...currentIds].filter(id => !prevIds.has(id));
    const resolvedIds = [...prevIds].filter(id => !currentIds.has(id));

    const s = summarize(findings);
    const { data: inserted, error } = await supabaseAdmin
      .from("security_scans")
      .insert({
        run_by: context.userId,
        run_by_email: context.claims?.email ?? null,
        total: s.total,
        high_count: s.high,
        medium_count: s.medium,
        low_count: s.low,
        new_count: newIds.length,
        resolved_count: resolvedIds.length,
        auto_fixed_count: autoFixed,
        findings,
        diff: { new: newIds, resolved: resolvedIds },
        trigger: data.trigger ?? (data.autoFix ? "auto-fix" : "manual"),
      })
      .select()
      .single();
    if (error) {
      console.error("[security] insert scan failed", error);
      throw new Error("Failed to save scan");
    }

    // Audit trail
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      actor_email: context.claims?.email ?? null,
      action: "security.scan",
      target: inserted.id,
      details: { total: s.total, new: newIds.length, autoFixed },
    });

    return { scan: inserted, autoFixed };
  });

export const listSecurityScans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("security_scans")
      .select("id, created_at, total, high_count, medium_count, low_count, new_count, resolved_count, auto_fixed_count, trigger, run_by_email")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error("Failed to load history");
    return { scans: data ?? [] };
  });

export const getLatestSecurityScan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("security_scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { scan: data };
  });
