#!/usr/bin/env node
// Automated security regression — runs after every build.
// Exits non-zero (blocking the deployment) when any check fails.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const passed = [];

function check(name, fn) {
  try {
    const ok = fn();
    if (ok === true) passed.push(name);
    else failures.push(`${name}: ${ok || "failed"}`);
  } catch (e) {
    failures.push(`${name}: ${e.message}`);
  }
}

const serverSrc = existsSync(join(root, "src/server.ts"))
  ? readFileSync(join(root, "src/server.ts"), "utf8") : "";

check("CSP header present", () =>
  /content-security-policy/i.test(serverSrc) || "src/server.ts missing CSP");
check("HSTS header present", () =>
  /strict-transport-security/i.test(serverSrc) || "missing HSTS");
check("X-Frame-Options DENY", () =>
  /x-frame-options[^,]*deny/i.test(serverSrc) || "missing or weak X-Frame-Options");
check("X-Content-Type-Options nosniff", () =>
  /x-content-type-options[^,]*nosniff/i.test(serverSrc) || "missing nosniff");
check("Referrer-Policy set", () =>
  /referrer-policy/i.test(serverSrc) || "missing Referrer-Policy");
check("frame-ancestors locked", () =>
  /frame-ancestors\s+'none'/i.test(serverSrc) || "CSP missing frame-ancestors 'none'");

// Forbid hard-coded service-role keys or .env leaks in client bundle
const dist = join(root, ".output");
if (existsSync(dist)) {
  check("No SERVICE_ROLE leaked in client", () => {
    const clientDir = join(dist, "public");
    if (!existsSync(clientDir)) return true;
    const { readdirSync, statSync } = require("node:fs");
    let leaked = false;
    const walk = (d) => {
      for (const f of readdirSync(d)) {
        const p = join(d, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(js|mjs|html)$/.test(f)) {
          const c = readFileSync(p, "utf8");
          if (c.includes("SERVICE_ROLE") || c.includes("service_role_key")) leaked = true;
        }
      }
    };
    walk(clientDir);
    return leaked ? "service role key reference found in client bundle" : true;
  });
}

// Forbid disabled RLS migrations
const migDir = join(root, "supabase/migrations");
if (existsSync(migDir)) {
  const { readdirSync } = await import("node:fs");
  check("No DISABLE ROW LEVEL SECURITY in migrations", () => {
    for (const f of readdirSync(migDir)) {
      if (!f.endsWith(".sql")) continue;
      const c = readFileSync(join(migDir, f), "utf8");
      if (/disable\s+row\s+level\s+security/i.test(c)) return `${f} disables RLS`;
    }
    return true;
  });
}

console.log("\n🔒 Security regression checks");
for (const p of passed) console.log(`  ✓ ${p}`);
for (const f of failures) console.error(`  ✗ ${f}`);

if (failures.length) {
  console.error(`\n❌ ${failures.length} security check(s) failed — blocking deployment.\n`);
  process.exit(1);
}
console.log(`\n✅ All ${passed.length} security checks passed.\n`);
