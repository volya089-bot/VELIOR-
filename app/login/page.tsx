"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Login(){
  const [email,setEmail]=useState(""); const [pass,setPass]=useState("");
  const [mode,setMode]=useState<"signup"|"login">("signup");
  const [msg,setMsg]=useState("");

  useEffect(()=>{ supabase.auth.getSession().then(({data})=>{ if(data.session) window.location.href="/app"; }); },[]);

  async function run(){
    setMsg("");
    try{
      if(mode==="signup"){
        const {error}=await supabase.auth.signUp({email,password:pass});
        if(error) throw error;
        setMsg("Account created. Confirm email if required, then login.");
      } else {
        const {error}=await supabase.auth.signInWithPassword({email,password:pass});
        if(error) throw error;
        window.location.href="/app";
      }
    }catch(e:any){ setMsg(e?.message||"Error"); }
  }

  return (
    <div>
      <div className="nav"><div className="container"><div className="navInner">
        <a className="brand" href="/"><div className="logoDot"/><div>VELIOR</div></a>
        <div className="navLinks"><a className="btn" href="/">Home</a><a className="btn" href="/app">Dashboard</a></div>
      </div></div></div>

      <div className="container" style={{paddingTop:34}}>
        <div className="grid">
          <div style={{gridColumn:"span 6"}}><div className="card"><div className="cardInner">
            <div className="h2">{mode==="signup"?"Create account":"Sign in"}</div>
            <p className="p">Access the engine dashboard to create monitors and view alerts.</p>
            <hr className="sep"/>
            <div className="row" style={{flexDirection:"column",alignItems:"stretch",gap:10}}>
              <input className="input" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)}/>
              <input className="input" placeholder="password" type="password" value={pass} onChange={e=>setPass(e.target.value)}/>
              <button className="btn btnPrimary" onClick={run}>{mode==="signup"?"Create":"Login"}</button>
              <button className="btn" onClick={()=>setMode(mode==="signup"?"login":"signup")}>Switch to {mode==="signup"?"login":"signup"}</button>
              {msg?<div className="small">{msg}</div>:null}
            </div>
          </div></div></div>

          <div style={{gridColumn:"span 6"}}><div className="card"><div className="cardInner">
            <div className="h3">How this works</div>
            <p className="p">After signup you can test the engine immediately. Paid plans unlock faster schedules.</p>
            <hr className="sep"/><div className="small">PRO: every 10 minutes • BUSINESS: every minute • FREE: hourly</div>
          </div></div></div>
        </div>
      </div>
    </div>
  );
}
