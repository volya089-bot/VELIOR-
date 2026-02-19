import { getSupabaseAdmin } from "../../lib/supabaseAdmin";

export function nowIso(){ return new Date().toISOString(); }

async function fetchText(url: string, timeoutMs: number){
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), timeoutMs);
  try{
    const res = await fetch(url, { signal: ctrl.signal, headers: { "user-agent": "VELIOR/1.0" } });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } finally { clearTimeout(t); }
}

async function fetchJson(url: string, timeoutMs: number){
  const { ok, status, text } = await fetchText(url, timeoutMs);
  let json: any = null; try{ json = JSON.parse(text); }catch{}
  return { ok, status, json, text };
}

async function runMonitor(m: any){
  const kind = m.kind;
  const rule = m.rule_json || {};

  if(kind==="url_uptime"){
    const expect = rule.expectStatus ?? 200;
    const timeoutMs = rule.timeoutMs ?? 9000;
    const { ok, status } = await fetchText(m.target, timeoutMs);
    const passed = ok && status===expect;
    return { passed, severity: passed?"info":"critical", title: passed?"Uptime OK":"Uptime FAIL", body: passed?`${m.target} returned ${status}`:`${m.target} returned ${status} (expected ${expect})`, meta:{status} };
  }

  if(kind==="keyword_watch"){
    const keyword = String(rule.keyword||"").trim();
    const { ok, status, text } = await fetchText(m.target, 12000);
    const found = ok && keyword && text.toLowerCase().includes(keyword.toLowerCase());
    return { passed: !found, severity: found?"warn":"info", title: found?"Keyword FOUND":"Keyword not found", body: found?`Found "${keyword}" on ${m.target}`:`Not found "${keyword}" on ${m.target} (status ${status})`, meta:{status,keyword,found} };
  }

  if(kind==="coingecko_price"){
    const id = String(m.target).trim();
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd,eur`;
    const { ok, status, json, text } = await fetchJson(url, 12000);
    const priceUsd = json?.[id]?.usd;
    const expr = String(rule.expr||"").trim();
    let triggered=false; let reason="";
    if(typeof priceUsd==="number" && expr){
      const mm = expr.match(/^([<>]=?|==)\s*([0-9]*\.?[0-9]+)$/);
      if(mm){
        const op=mm[1]; const val=Number(mm[2]);
        if(op===">") triggered = priceUsd>val;
        if(op===">=") triggered = priceUsd>=val;
        if(op==="<") triggered = priceUsd<val;
        if(op==="<=") triggered = priceUsd<=val;
        if(op==="==") triggered = priceUsd===val;
        reason = `priceUsd=${priceUsd} ${op} ${val} => ${triggered}`;
      } else reason="Invalid rule format";
    } else reason="Missing price or rule";
    return { passed: !triggered, severity: triggered?"warn":"info", title: triggered?"Price rule TRIGGERED":"Price rule not triggered", body: `CoinGecko ${id}: ${reason}`, meta:{status,priceUsd,expr,ok,raw: ok?json:text} };
  }

  return { passed:true, severity:"info", title:"Unknown monitor", body:"No-op", meta:{} };
}

export async function runDueChecksForPlan(plan: "PRO"|"BUSINESS"){
  const supabase = getSupabaseAdmin();
  const { data: profiles, error } = await supabase.from("profiles").select("id").eq("plan", plan).eq("plan_status", "active");
  if(error) throw error;

  let totalRuns=0, totalAlerts=0;
  for(const p of (profiles||[])){
    const { data: mons, error: mErr } = await supabase.from("monitors").select("*").eq("user_id", p.id).eq("enabled", true);
    if(mErr) throw mErr;

    for(const m of (mons||[])){
      const enforced = plan==="BUSINESS"?1:10;
      if(m.interval_minutes !== enforced) await supabase.from("monitors").update({interval_minutes:enforced}).eq("id", m.id);
      const last = m.last_run_at ? new Date(m.last_run_at).getTime() : 0;
      const intervalMs = enforced*60*1000;
      if(Date.now()-last < intervalMs) continue;

      const result = await runMonitor(m);
      totalRuns += 1;

      await supabase.from("monitor_runs").insert({ user_id:p.id, monitor_id:m.id, ok:result.passed, severity:result.severity, title:result.title, body:result.body, meta:result.meta });
      await supabase.from("monitors").update({ last_run_at: nowIso() }).eq("id", m.id);

      const shouldAlert = result.severity==="warn" || result.severity==="critical";
      if(shouldAlert){
        totalAlerts += 1;
        await supabase.from("alerts").insert({ user_id:p.id, monitor_id:m.id, severity:result.severity, title:result.title, body:result.body });
      }
    }
  }
  return { totalRuns, totalAlerts };
}
