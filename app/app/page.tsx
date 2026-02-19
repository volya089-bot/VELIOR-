"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { config } from "../../lib/config";

type Profile = { plan:"FREE"|"PRO"|"BUSINESS"; plan_status:"inactive"|"pending"|"active" };
type Monitor = { id:string; name:string; kind:"url_uptime"|"keyword_watch"|"coingecko_price"; target:string; rule_json:any; enabled:boolean; interval_minutes:number; created_at:string; };
type Alert = { id:string; monitor_id:string; severity:"info"|"warn"|"critical"; title:string; body:string; created_at:string; };

export default function Dashboard(){
  const [userEmail,setUserEmail]=useState("");
  const [profile,setProfile]=useState<Profile>({plan:"FREE",plan_status:"inactive"});
  const [monitors,setMonitors]=useState<Monitor[]>([]);
  const [alerts,setAlerts]=useState<Alert[]>([]);
  const [tab,setTab]=useState<"monitors"|"alerts"|"billing">("monitors");
  const [msg,setMsg]=useState("");

  const [name,setName]=useState(""); const [kind,setKind]=useState<Monitor["kind"]>("url_uptime");
  const [target,setTarget]=useState(""); const [rule,setRule]=useState("");

  useEffect(()=>{(async()=>{
    const {data}=await supabase.auth.getSession();
    if(!data.session){ window.location.href="/login"; return; }
    setUserEmail(data.session.user.email||"");
    await ensureProfile(); await refreshAll();
    supabase.auth.onAuthStateChange((_e,s)=>{ if(!s) window.location.href="/login"; });
  })();},[]);

  async function ensureProfile(){
    const {data}=await supabase.auth.getSession();
    const uid=data.session?.user.id; if(!uid) return;
    await supabase.from("profiles").upsert({id:uid},{onConflict:"id"});
    const {data:p}=await supabase.from("profiles").select("plan,plan_status").eq("id",uid).single();
    if(p) setProfile(p as any);
  }
  async function refreshAll(){
    setMsg("");
    const {data:mons}=await supabase.from("monitors").select("*").order("created_at",{ascending:false});
    setMonitors((mons||[]) as any);
    const {data:als}=await supabase.from("alerts").select("*").order("created_at",{ascending:false}).limit(50);
    setAlerts((als||[]) as any);
    const {data:sess}=await supabase.auth.getSession();
    const uid=sess.session?.user.id; if(!uid) return;
    const {data:p}=await supabase.from("profiles").select("plan,plan_status").eq("id",uid).single();
    if(p) setProfile(p as any);
  }

  async function addMonitor(){
    setMsg("");
    try{
      if(!name.trim()) throw new Error("Name is required");
      if(!target.trim()) throw new Error("Target is required");
      let rule_json:any={};
      if(kind==="keyword_watch"){ if(!rule.trim()) throw new Error("Keyword required"); rule_json={keyword:rule.trim()}; }
      if(kind==="coingecko_price"){ if(!rule.trim()) throw new Error("Rule required, e.g. >= 0.05"); rule_json={expr:rule.trim()}; }
      if(kind==="url_uptime"){ rule_json={expectStatus:200,timeoutMs:9000}; }

      const interval_minutes = profile.plan_status==="active" ? (profile.plan==="BUSINESS"?1:(profile.plan==="PRO"?10:60)) : 60;

      const {error}=await supabase.from("monitors").insert({name,kind,target,rule_json,enabled:true,interval_minutes});
      if(error) throw error;
      setName(""); setTarget(""); setRule("");
      await refreshAll();
      setMsg("Monitor created.");
    }catch(e:any){ setMsg(e?.message||"Error"); }
  }

  async function toggleMonitor(m:Monitor){
    await supabase.from("monitors").update({enabled:!m.enabled}).eq("id",m.id);
    await refreshAll();
  }
  async function deleteMonitor(id:string){
    await supabase.from("monitors").delete().eq("id",id);
    await refreshAll();
  }
  async function logout(){ await supabase.auth.signOut(); window.location.href="/"; }

  async function activatePlan(plan:"PRO"|"BUSINESS"){
    const {data}=await supabase.auth.getSession(); const uid=data.session?.user.id; if(!uid) return;
    await supabase.from("profiles").update({plan,plan_status:"pending"}).eq("id",uid);
    await refreshAll();
    setMsg("Plan set to pending. If you already paid, click Confirm activation.");
  }
  async function confirmActivation(){
    const {data}=await supabase.auth.getSession(); const uid=data.session?.user.id; if(!uid) return;
    await supabase.from("profiles").update({plan_status:"active"}).eq("id",uid);
    await refreshAll();
    setMsg("Plan activated (demo mode).");
  }

  return (
    <div>
      <div className="nav"><div className="container"><div className="navInner">
        <a className="brand" href="/"><div className="logoDot"/><div>VELIOR</div></a>
        <div className="navLinks">
          <span className="small">{userEmail}</span>
          <span className="badge">{profile.plan} • {profile.plan_status}</span>
          <button className="btn" onClick={()=>setTab("monitors")}>Monitors</button>
          <button className="btn" onClick={()=>setTab("alerts")}>Alerts</button>
          <button className="btn" onClick={()=>setTab("billing")}>Billing</button>
          <button className="btn btnDanger" onClick={logout}>Logout</button>
        </div>
      </div></div></div>

      <div className="container" style={{paddingTop:20}}>
        {msg?<div className="small" style={{marginBottom:10}}>{msg}</div>:null}

        {tab==="monitors"?(
          <div className="grid">
            <div style={{gridColumn:"span 5"}}><div className="card"><div className="cardInner">
              <div className="h2">Create monitor</div>
              <p className="p">Checks run automatically (PRO 10m, BUSINESS 1m, FREE 60m).</p>
              <hr className="sep"/>
              <div className="row" style={{flexDirection:"column",alignItems:"stretch",gap:10}}>
                <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)}/>
                <select className="input" value={kind} onChange={e=>setKind(e.target.value as any)}>
                  <option value="url_uptime">URL uptime</option>
                  <option value="keyword_watch">Keyword watch</option>
                  <option value="coingecko_price">CoinGecko price</option>
                </select>
                <input className="input" placeholder={kind==="coingecko_price"?"CoinGecko id (e.g. bitcoin)":"Target URL (https://...)"} value={target} onChange={e=>setTarget(e.target.value)}/>
                <input className="input" placeholder={kind==="keyword_watch"?"Keyword to watch":(kind==="coingecko_price"?'Rule (e.g. ">= 0.05")':"Optional")} value={rule} onChange={e=>setRule(e.target.value)}/>
                <button className="btn btnPrimary" onClick={addMonitor}>Add monitor</button>
                <div className="small">Tip: CoinGecko rules: <code>{">= 1.00"}</code> / <code>{"<= 0.024"}</code></div>
              </div>
            </div></div></div>

            <div style={{gridColumn:"span 7"}}><div className="card"><div className="cardInner">
              <div className="h2">Monitors</div><p className="p">Your configured monitors and their schedule.</p><hr className="sep"/>
              <table className="table"><thead><tr><th>Name</th><th>Type</th><th>Target</th><th>Interval</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {monitors.map(m=>(
                  <tr key={m.id}>
                    <td>{m.name}</td><td>{m.kind}</td>
                    <td style={{maxWidth:260,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.target}</td>
                    <td>{m.interval_minutes}m</td><td>{m.enabled?"enabled":"paused"}</td>
                    <td className="row" style={{justifyContent:"flex-end"}}>
                      <button className="btn" onClick={()=>toggleMonitor(m)}>{m.enabled?"Pause":"Resume"}</button>
                      <button className="btn btnDanger" onClick={()=>deleteMonitor(m.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {monitors.length===0?<tr><td colSpan={6} className="small">No monitors yet.</td></tr>:null}
              </tbody></table>
            </div></div></div>
          </div>
        ):null}

        {tab==="alerts"?(
          <div className="card"><div className="cardInner">
            <div className="h2">Alerts</div><p className="p">Latest alerts triggered by scheduled checks.</p><hr className="sep"/>
            <table className="table"><thead><tr><th>Time</th><th>Severity</th><th>Title</th><th>Details</th></tr></thead>
            <tbody>
              {alerts.map(a=>(
                <tr key={a.id}>
                  <td>{new Date(a.created_at).toLocaleString()}</td>
                  <td>{a.severity}</td><td>{a.title}</td>
                  <td style={{color:"rgba(231,238,248,.75)"}}>{a.body}</td>
                </tr>
              ))}
              {alerts.length===0?<tr><td colSpan={4} className="small">No alerts yet.</td></tr>:null}
            </tbody></table>
          </div></div>
        ):null}

        {tab==="billing"?(
          <div className="grid">
            <div style={{gridColumn:"span 6"}}><div className="card"><div className="cardInner">
              <div className="h2">Subscription</div>
              <p className="p">Pay with Stripe links, then activate plan to unlock schedule.</p>
              <hr className="sep"/>
              <div className="row">
                <a className="btn btnPrimary" href={config.stripeProLink} target="_blank">Pay PRO</a>
                <a className="btn btnPrimary" href={config.stripeBusinessLink} target="_blank">Pay BUSINESS</a>
              </div>
              <div className="small" style={{marginTop:10}}>Promo: <code>{config.promo5}</code> / <code>{config.promo10}</code></div>
              <hr className="sep"/>
              <div className="row">
                <button className="btn" onClick={()=>activatePlan("PRO")}>Mark PRO (pending)</button>
                <button className="btn" onClick={()=>activatePlan("BUSINESS")}>Mark BUSINESS (pending)</button>
                <button className="btn btnPrimary" onClick={confirmActivation}>Confirm activation</button>
              </div>
              <div className="small" style={{marginTop:10}}>Webhook verification can be added later; this build includes demo activation for testing.</div>
            </div></div></div>

            <div style={{gridColumn:"span 6"}}><div className="card"><div className="cardInner">
              <div className="h3">Plan behavior</div>
              <p className="p">PRO: 10m • BUSINESS: 1m • FREE: 60m</p>
              <hr className="sep"/>
              <div className="small">Scheduled jobs run in Netlify (cron). Runs are stored in Supabase as an audit trail.</div>
            </div></div></div>
          </div>
        ):null}

        <div style={{height:26}}/>
        <button className="btn" onClick={refreshAll}>Refresh</button>
      </div>
    </div>
  );
}
