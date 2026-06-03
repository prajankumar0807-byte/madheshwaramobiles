import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listRepairs, createRepair, updateRepair, listFeedback, checkAdmin } from "@/lib/shop.functions";
import { logAdminLogin, listAuditLogs, verifyAuditChain, exportAuditLogs, getSecurityAlerts } from "@/lib/audit.functions";
import { runSecurityScan, listSecurityScans, getLatestSecurityScan } from "@/lib/security.functions";
import { ShopLogo } from "@/components/ShopLogo";
import { LogOut, ShieldCheck, ShieldAlert, Download, FileText, AlertTriangle, Play, Wrench, History, TrendingUp, TrendingDown } from "lucide-react";
import { VisitorStat } from "@/components/VisitorCounter";



export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const check = useServerFn(checkAdmin);
  const logLogin = useServerFn(logAdminLogin);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "SIGNED_IN") logLogin().catch(() => {});
    });
    return () => sub.subscription.unsubscribe();
  }, [logLogin]);

  useEffect(() => {
    if (session) check().then(r => setIsAdmin(r.isAdmin)).catch(() => setIsAdmin(false));
  }, [session, check]);

  if (!ready) return <div className="min-h-screen flex items-center justify-center"><div className="text-gold">Loading…</div></div>;
  if (!session) return <AuthForm />;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-muted-foreground">This account is not an admin.</p>
      <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 rounded-full glass-card">Sign out</button>
    </div>
  );
  return <Dashboard />;
}

function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try {
      const { error } = mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password: pass })
        : await supabase.auth.signUp({ email, password: pass, options: { emailRedirectTo: window.location.origin + "/admin" } });
      if (error) setErr(error.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card rounded-3xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <ShopLogo className="h-20 w-20 mb-4" />
          <div className="font-display gradient-gold-text">ADMIN DASHBOARD</div>
          <div className="text-xs text-muted-foreground mt-1">Sri Madheshwara Mobiles</div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            className="w-full rounded-xl bg-secondary/60 border border-[color:var(--gold)]/20 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]" />
          <input type="password" required minLength={6} value={pass} onChange={e => setPass(e.target.value)} placeholder="Password"
            className="w-full rounded-xl bg-secondary/60 border border-[color:var(--gold)]/20 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]" />
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button disabled={busy} className="w-full py-3 rounded-xl gradient-gold-bg text-background font-semibold shadow-gold disabled:opacity-50">
            {busy ? "…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-4 w-full text-xs text-muted-foreground hover:text-gold">
          {mode === "login" ? "First time? Create the admin account" : "Already have an account? Sign in"}
        </button>
        <p className="mt-4 text-[10px] text-center text-muted-foreground">Admin access is restricted. Contact the shop owner for credentials.</p>
        <Link to="/" className="mt-4 block text-center text-xs text-gold">← Back to website</Link>
      </div>
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<"repairs" | "feedback" | "audit" | "alerts" | "security">("repairs");
  return (
    <div className="min-h-screen">
      <div className="border-b border-[color:var(--gold)]/20 glass">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShopLogo className="h-9 w-9" glow={false} />
            <div className="font-display gradient-gold-text text-sm">ADMIN</div>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-xs text-muted-foreground hover:text-gold inline-flex items-center gap-1">
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] tracking-[0.4em] text-gold">DASHBOARD</div>
            <div className="font-display text-xl gradient-gold-text">Welcome, M.V.MADHESH</div>
          </div>
          <VisitorStat />
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["repairs","feedback","audit","alerts","security"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest transition ${tab===t?"gradient-gold-bg text-background":"glass-card text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
        {tab === "repairs" && <RepairsTab />}
        {tab === "feedback" && <FeedbackTab />}
        {tab === "audit" && <AuditTab />}
        {tab === "alerts" && <AlertsTab />}
        {tab === "security" && <SecurityTab />}
      </div>
    </div>
  );
}

function SecurityTab() {
  const runScan = useServerFn(runSecurityScan);
  const listScans = useServerFn(listSecurityScans);
  const getLatest = useServerFn(getLatestSecurityScan);
  const [latest, setLatest] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [autoFixBusy, setAutoFixBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    const [l, h] = await Promise.all([getLatest(), listScans()]);
    setLatest(l.scan); setHistory(h.scans);
  };
  useEffect(() => { refresh(); }, []);

  const scan = async (autoFix = false) => {
    setErr(null);
    autoFix ? setAutoFixBusy(true) : setBusy(true);
    try {
      await runScan({ data: { autoFix, trigger: autoFix ? "auto-fix" : "manual" } });
      await refresh();
    } catch (e: any) { setErr(e?.message ?? "Scan failed"); }
    finally { setBusy(false); setAutoFixBusy(false); }
  };

  const sevColor = (s: string) => s === "high" ? "border-destructive/60 text-destructive bg-destructive/5"
    : s === "medium" ? "border-amber-500/50 text-amber-400 bg-amber-500/5"
    : "border-muted/40 text-muted-foreground";

  const findings: any[] = latest?.findings ?? [];
  const diff = latest?.diff ?? { new: [], resolved: [] };
  const newSet = new Set(diff.new ?? []);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <button onClick={() => scan(false)} disabled={busy || autoFixBusy}
          className="px-4 py-2 rounded-lg gradient-gold-bg text-background text-xs font-semibold inline-flex items-center gap-2 disabled:opacity-50">
          <Play className="h-3 w-3" /> {busy ? "Scanning…" : "Run scan now"}
        </button>
        <button onClick={() => scan(true)} disabled={busy || autoFixBusy}
          className="px-4 py-2 rounded-lg glass-card text-xs inline-flex items-center gap-2 hover:text-gold disabled:opacity-50">
          <Wrench className="h-3 w-3" /> {autoFixBusy ? "Fixing & re-scanning…" : "Auto-fix safe issues"}
        </button>
        {err && <span className="text-xs text-destructive">{err}</span>}
        {latest && <span className="text-[10px] text-muted-foreground ml-auto">Last scan {new Date(latest.created_at).toLocaleString()}</span>}
      </div>

      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <Stat label="Total" value={latest.total} />
          <Stat label="High" value={latest.high_count} tone="text-destructive" />
          <Stat label="Medium" value={latest.medium_count} tone="text-amber-400" />
          <Stat label="New" value={latest.new_count} tone="text-destructive" icon={<TrendingUp className="h-3 w-3" />} />
          <Stat label="Resolved" value={latest.resolved_count} tone="text-emerald-400" icon={<TrendingDown className="h-3 w-3" />} />
        </div>
      )}

      {latest && findings.length === 0 && (
        <div className="glass-card rounded-xl p-6 text-center text-sm text-emerald-400 inline-flex items-center justify-center gap-2 w-full">
          <ShieldCheck className="h-4 w-4" /> No security issues detected.
        </div>
      )}

      <div className="space-y-2">
        {findings.map((f) => (
          <div key={f.id} className={`glass-card rounded-xl p-3 border ${sevColor(f.severity)}`}>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
              <AlertTriangle className="h-3 w-3" /> {f.severity} · {f.category}
              {newSet.has(f.id) && <span className="px-1.5 py-0.5 rounded bg-destructive/20 text-destructive">NEW</span>}
              {f.auto_fixable && <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">auto-fixable</span>}
            </div>
            <p className="text-sm mt-1 text-foreground font-semibold">{f.title}</p>
            {f.file && <p className="text-[10px] font-mono text-muted-foreground mt-1">{f.file}</p>}
            <p className="text-xs mt-2 text-muted-foreground"><span className="text-gold">Fix:</span> {f.recommendation}</p>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div>
          <div className="text-[10px] tracking-[0.4em] text-gold mb-2 inline-flex items-center gap-1"><History className="h-3 w-3" /> SCAN HISTORY</div>
          <div className="space-y-1">
            {history.map(h => (
              <div key={h.id} className="glass-card rounded-lg p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{new Date(h.created_at).toLocaleString()}</span>
                <span className="text-[10px] uppercase tracking-widest text-gold">{h.trigger}</span>
                <span>
                  <span className="text-destructive">{h.high_count}H</span>{" · "}
                  <span className="text-amber-400">{h.medium_count}M</span>{" · "}
                  <span className="text-muted-foreground">{h.low_count}L</span>
                </span>
                <span className={h.new_count > 0 ? "text-destructive" : "text-muted-foreground"}>+{h.new_count} new</span>
                <span className="text-emerald-400">−{h.resolved_count} resolved</span>
                {h.auto_fixed_count > 0 && <span className="text-emerald-400">🔧 {h.auto_fixed_count}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone, icon }: { label: string; value: number; tone?: string; icon?: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-3 text-center">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground inline-flex items-center justify-center gap-1">{icon}{label}</div>
      <div className={`font-display text-2xl ${tone ?? "gradient-gold-text"}`}>{value ?? 0}</div>
    </div>
  );
}

function AlertsTab() {
  const fetchAlerts = useServerFn(getSecurityAlerts);
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(true);
  const refresh = () => { setBusy(true); fetchAlerts().then(setData).finally(() => setBusy(false)); };
  useEffect(() => { refresh(); }, []);
  const tone = (l: string) => l === "high" ? "border-destructive/60 text-destructive"
    : l === "medium" ? "border-amber-500/50 text-amber-400" : "border-muted/40 text-muted-foreground";
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Audit entries</div>
          <div className="font-display gradient-gold-text text-2xl">{data?.audit_entries ?? "—"}</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Logins 24h</div>
          <div className="font-display gradient-gold-text text-2xl">{data?.logins_24h ?? "—"}</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Open alerts</div>
          <div className="font-display gradient-gold-text text-2xl">{data?.alerts?.length ?? "—"}</div>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={refresh} disabled={busy} className="px-3 py-1 rounded-full glass-card text-xs hover:text-gold disabled:opacity-50">
          {busy ? "Scanning…" : "Re-scan"}
        </button>
      </div>
      {!busy && (data?.alerts?.length ?? 0) === 0 && (
        <div className="glass-card rounded-xl p-6 text-center text-sm text-emerald-400 inline-flex items-center justify-center gap-2 w-full">
          <ShieldCheck className="h-4 w-4" /> No suspicious activity detected.
        </div>
      )}
      <div className="space-y-2">
        {data?.alerts?.map((a: any, i: number) => (
          <div key={i} className={`glass-card rounded-xl p-3 border ${tone(a.level)}`}>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
              <AlertTriangle className="h-3 w-3" /> {a.level} · {a.type}
            </div>
            <p className="text-sm mt-1 text-foreground">{a.message}</p>
            {a.at && <p className="text-[10px] text-muted-foreground mt-1">{new Date(a.at).toLocaleString()}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function RepairsTab() {
  const list = useServerFn(listRepairs); const create = useServerFn(createRepair); const update = useServerFn(updateRepair);
  const [jobs, setJobs] = useState<any[]>([]); const [form, setForm] = useState({ customer_name: "", phone: "", device: "", issue: "", status: "Received" });
  const refresh = () => list().then(r => setJobs(r.jobs));
  useEffect(() => { refresh(); }, []);
  const STATUSES = ["Received","Under Diagnosis","Repairing","Completed","Ready for Delivery"];
  const add = async (e: React.FormEvent) => { e.preventDefault();
    await create({ data: form }); setForm({ customer_name:"", phone:"", device:"", issue:"", status:"Received" }); refresh();
  };
  return (
    <div className="space-y-6">
      <form onSubmit={add} className="glass-card rounded-2xl p-4 grid sm:grid-cols-5 gap-2">
        <input required placeholder="Customer" value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})} className="rounded-lg bg-secondary/60 px-3 py-2 text-sm" />
        <input required placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="rounded-lg bg-secondary/60 px-3 py-2 text-sm" />
        <input required placeholder="Device" value={form.device} onChange={e=>setForm({...form,device:e.target.value})} className="rounded-lg bg-secondary/60 px-3 py-2 text-sm" />
        <input placeholder="Issue" value={form.issue} onChange={e=>setForm({...form,issue:e.target.value})} className="rounded-lg bg-secondary/60 px-3 py-2 text-sm" />
        <button className="rounded-lg gradient-gold-bg text-background font-semibold text-sm">+ Add Job</button>
      </form>
      <div className="space-y-2">
        {jobs.map(j => (
          <div key={j.id} className="glass-card rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <div className="font-display gradient-gold-text">{j.job_code}</div>
              <div className="text-xs text-muted-foreground">{j.customer_name} · {j.phone} · {j.device}</div>
            </div>
            <select value={j.status} onChange={async e => { await update({ data: { id: j.id, status: e.target.value } }); refresh(); }}
              className="rounded-lg bg-secondary/60 border border-[color:var(--gold)]/20 px-3 py-2 text-xs">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        ))}
        {jobs.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No jobs yet.</p>}
      </div>
    </div>
  );
}

function FeedbackTab() {
  const list = useServerFn(listFeedback); const [items, setItems] = useState<any[]>([]);
  useEffect(() => { list().then(r => setItems(r.feedback)); }, [list]);
  return (
    <div className="space-y-3">
      {items.map(f => (
        <div key={f.id} className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{f.name || "Anonymous"} {f.phone && `· ${f.phone}`}</span>
            <span className="text-gold">{"★".repeat(f.rating)}{"☆".repeat(5-f.rating)}</span>
          </div>
          <p className="text-sm">{f.message}</p>
          {f.sentiment && <div className="mt-2 text-[10px] uppercase tracking-widest text-gold">{f.sentiment}</div>}
        </div>
      ))}
      {items.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No feedback yet.</p>}
    </div>
  );
}

// OffersTab removed — AI-generated offers feature retired per request.

function AuditTab() {
  const list = useServerFn(listAuditLogs);
  const verify = useServerFn(verifyAuditChain);
  const exp = useServerFn(exportAuditLogs);
  const [logs, setLogs] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);
  const [integrity, setIntegrity] = useState<{ ok: boolean; total: number; issues: any[] } | null>(null);
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [exporting, setExporting] = useState(false);
  useEffect(() => { list().then(r => setLogs(r.logs)).finally(() => setBusy(false)); }, [list]);
  const fmt = (s: string) => new Date(s).toLocaleString();
  const label: Record<string, string> = {
    "admin.login": "🔐 Admin login",
    "role.grant": "➕ Role granted",
    "role.revoke": "➖ Role revoked",
    "audit.export": "📤 Audit exported",
  };
  const runVerify = async () => { setIntegrity(null); const r = await verify(); setIntegrity(r); };
  const toIso = (v: string) => v ? new Date(v).toISOString() : undefined;
  const flaggedSeq = new Set((integrity?.issues ?? []).map(i => i.seq));

  const download = (name: string, blob: Blob) => {
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  };
  const doExport = async (kind: "csv" | "pdf") => {
    setExporting(true);
    try {
      const r = await exp({ data: { from: toIso(from), to: toIso(to) } });
      const stamp = new Date().toISOString().slice(0,10);
      if (kind === "csv") {
        download(`audit-${stamp}.csv`, new Blob([r.csv], { type: "text/csv" }));
      } else {
        // Lightweight printable HTML → user picks "Save as PDF"
        const w = window.open("", "_blank"); if (!w) return;
        const rows = r.csv.split("\n").map(l => l.split(",").map(c => c.replace(/^"|"$/g, "").replace(/""/g,'"')));
        w.document.write(`<title>Audit Log ${stamp}</title>
          <style>body{font:12px ui-sans-serif;padding:24px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 6px;font-size:10px;text-align:left;vertical-align:top}th{background:#111;color:#d4af37}</style>
          <h2>Sri Madheshwara Mobiles — Audit Log</h2>
          <p>Generated ${new Date().toLocaleString()} · ${r.rows} entries</p>
          <table>${rows.map((row,i)=>`<tr>${row.map(c=>`<${i===0?"th":"td"}>${c.replace(/</g,"&lt;")}</${i===0?"th":"td"}>`).join("")}</tr>`).join("")}</table>
          <script>window.onload=()=>window.print()</script>`);
        w.document.close();
      }
    } finally { setExporting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <button onClick={runVerify} className="px-3 py-2 rounded-lg glass-card text-xs inline-flex items-center gap-2 hover:text-gold">
          <ShieldCheck className="h-4 w-4" /> Verify integrity
        </button>
        {integrity && (
          <span className={`text-xs inline-flex items-center gap-1 ${integrity.ok ? "text-emerald-400" : "text-destructive"}`}>
            {integrity.ok ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
            {integrity.ok ? `Chain valid · ${integrity.total} entries` : `${integrity.issues.length} issue(s) across ${integrity.total} entries`}
          </span>
        )}
        <div className="flex-1" />
        <input type="datetime-local" value={from} onChange={e=>setFrom(e.target.value)} className="rounded-lg bg-secondary/60 px-2 py-1 text-xs" />
        <span className="text-xs text-muted-foreground">to</span>
        <input type="datetime-local" value={to} onChange={e=>setTo(e.target.value)} className="rounded-lg bg-secondary/60 px-2 py-1 text-xs" />
        <button disabled={exporting} onClick={()=>doExport("csv")} className="px-3 py-2 rounded-lg gradient-gold-bg text-background text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-50">
          <Download className="h-3 w-3" /> CSV
        </button>
        <button disabled={exporting} onClick={()=>doExport("pdf")} className="px-3 py-2 rounded-lg glass-card text-xs inline-flex items-center gap-1 hover:text-gold disabled:opacity-50">
          <FileText className="h-3 w-3" /> PDF
        </button>
      </div>

      {integrity && integrity.issues.length > 0 && (
        <div className="glass-card rounded-xl p-3 border border-destructive/40">
          <div className="text-xs uppercase tracking-widest text-destructive mb-2 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" /> Suspicious findings
          </div>
          <ul className="space-y-1 text-xs">
            {integrity.issues.map((i, idx) => (
              <li key={idx}>· <span className="text-gold">#{i.seq}</span> [{i.type}] {i.message}</li>
            ))}
          </ul>
        </div>
      )}

      {busy && <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>}
      {!busy && logs.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No audit events yet.</p>}
      {logs.map(l => (
        <div key={l.id} className={`glass-card rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 ${flaggedSeq.has(l.seq) ? "border border-destructive/60" : ""}`}>
          <div className="min-w-0">
            <div className="text-sm gradient-gold-text font-semibold">
              <span className="text-[10px] text-muted-foreground mr-2">#{l.seq}</span>
              {label[l.action] ?? l.action}
            </div>
            <div className="text-xs text-muted-foreground truncate">{l.actor_email || l.actor_id || "system"}{l.target ? ` → ${l.target}` : ""}</div>
            {l.details && <div className="text-[10px] text-muted-foreground mt-1 font-mono break-all">{JSON.stringify(l.details)}</div>}
            {l.row_hash && <div className="text-[9px] text-muted-foreground/60 font-mono mt-1 truncate">hash: {l.row_hash.slice(0,16)}…</div>}
          </div>
          <span className="text-[10px] text-gold whitespace-nowrap">{fmt(l.created_at)}</span>
        </div>
      ))}
    </div>
  );
}
