import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const bumpVisit = createServerFn({ method: "POST" }).handler(async () => {
  const { data, error } = await supabaseAdmin.rpc("increment_site_visits");
  if (error) {
    const { data: row } = await supabaseAdmin.from("site_stats").select("visits").eq("id", 1).maybeSingle();
    return { visits: Number(row?.visits ?? 0) };
  }
  return { visits: Number(data ?? 0) };
});

export const getVisits = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin.from("site_stats").select("visits").eq("id", 1).maybeSingle();
  return { visits: Number(data?.visits ?? 0) };
});
