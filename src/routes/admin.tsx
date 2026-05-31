import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listRepairs, createRepair, updateRepair, listFeedback, checkAdmin } from "@/lib/shop.functions";
import { generateOffers } from "@/lib/ai.functions";
import { ShopLogo } from "@/components/ShopLogo";
import { Sparkles, LogOut } from "lucide-react";
import { VisitorStat } from "@/components/VisitorCounter";



export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const check = useServerFn(checkAdmin);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

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
      if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
        setErr("Access restricted. This dashboard is for the shop owner only.");
        return;
      }
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
        <p className="mt-4 text-[10px] text-center text-muted-foreground">First account created becomes admin automatically.</p>
        <Link to="/" className="mt-4 block text-center text-xs text-gold">← Back to website</Link>
      </div>
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<"repairs" | "feedback" | "offers">("repairs");
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
        <div className="flex gap-2 mb-6">
          {(["repairs","feedback","offers"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest transition ${tab===t?"gradient-gold-bg text-background":"glass-card text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
        {tab === "repairs" && <RepairsTab />}
        {tab === "feedback" && <FeedbackTab />}
        {tab === "offers" && <OffersTab />}
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

function OffersTab() {
  const gen = useServerFn(generateOffers);
  const [theme, setTheme] = useState("Diwali festival sale"); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<string | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const refresh = () => supabase.from("offers").select("*").order("created_at", { ascending: false }).then(({ data }) => setOffers(data ?? []));
  useEffect(() => { refresh(); }, []);
  const run = async () => { setBusy(true); setMsg(null);
    try { const r = await gen({ data: { theme } }); setMsg(`✨ Created ${r.created} offers`); refresh(); }
    catch (e: any) { setMsg(e?.message ?? "Failed"); } finally { setBusy(false); }
  };
  const toggle = async (id: string, active: boolean) => { await supabase.from("offers").update({ active: !active }).eq("id", id); refresh(); };
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-2 items-center">
        <Sparkles className="h-4 w-4 text-gold" />
        <input value={theme} onChange={e => setTheme(e.target.value)} placeholder="Theme (e.g. Diwali sale)"
          className="flex-1 min-w-[200px] rounded-lg bg-secondary/60 px-3 py-2 text-sm" />
        <button onClick={run} disabled={busy} className="px-4 py-2 rounded-lg gradient-gold-bg text-background font-semibold text-sm disabled:opacity-50">
          {busy ? "Generating…" : "AI Generate Offers"}
        </button>
        {msg && <span className="text-xs text-gold">{msg}</span>}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {offers.map(o => (
          <div key={o.id} className={`glass-card rounded-xl p-4 ${!o.active && "opacity-50"}`}>
            <div className="flex justify-between items-start gap-2">
              <div>
                {o.badge && <div className="text-[10px] tracking-widest text-gold mb-1">{o.badge}</div>}
                <div className="font-display gradient-gold-text">{o.title}</div>
                <p className="text-xs text-muted-foreground mt-1">{o.description}</p>
              </div>
              <button onClick={() => toggle(o.id, o.active)} className="text-[10px] uppercase tracking-widest text-gold">
                {o.active ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
