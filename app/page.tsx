import { config } from "../lib/config";

function Nav(){
  return (
    <div className="nav">
      <div className="container">
        <div className="navInner">
          <div className="brand"><div className="logoDot" /><div>VELIOR</div></div>
          <div className="navLinks">
            <a href="#product">Product</a><a href="#security">Security</a><a href="#pricing">Pricing</a><a href="#promo">Promo</a>
            <a className="btn" href="/app">Dashboard</a>
            <a className="btn btnPrimary" href="/login">Start</a>
          </div>
        </div>
      </div>
    </div>
  );
}
function Card({title,desc}:{title:string;desc:string}){return (<div className="card"><div className="cardInner"><div className="h3">{title}</div><p className="p">{desc}</p></div></div>);}
export default function Home(){
  return (
    <div>
      <Nav/>
      <div className="container">
        <div className="hero">
          <div className="kicker">Infrastructure • Monitoring • Reporting</div>
          <div className="h1">Infrastructure for Digital Asset Intelligence.</div>
          <p className="sub">VELIOR provides monitoring, alerts, and audit-ready reporting — delivered on schedule.</p>
          <div className="row" style={{marginTop:18}}>
            <a className="btn btnPrimary" href="#pricing">Choose a plan</a>
            <a className="btn" href="/app">Open dashboard</a>
            <span className="badge">Scheduled checks</span><span className="badge">Supabase + Netlify</span>
          </div>
        </div>

        <div id="product" className="section">
          <div className="row" style={{justifyContent:"space-between"}}><div className="h2">What you’re buying</div><div className="small">Designed for clarity and repeatability</div></div>
          <div className="grid">
            <div style={{gridColumn:"span 4"}}><Card title="Monitoring" desc="Create monitors for URLs, token prices, and keywords. Results are stored with context." /></div>
            <div style={{gridColumn:"span 4"}}><Card title="Alerts" desc="Rules trigger alerts automatically. Alerts appear in your dashboard (email/Telegram later)." /></div>
            <div style={{gridColumn:"span 4"}}><Card title="Reporting" desc="Audit trail logs: what changed, when, and why it matters." /></div>
            <div style={{gridColumn:"span 6"}}><Card title="Real engine" desc="This is not only a landing page — you get a working dashboard to test immediately." /></div>
            <div style={{gridColumn:"span 6"}}><Card title="Stripe checkout" desc="Subscriptions run through Stripe payment links. Plan unlocks in dashboard." /></div>
          </div>
        </div>

        <div id="security" className="section">
          <div className="row" style={{justifyContent:"space-between"}}><div className="h2">Security & posture</div><div className="small">Calm, factual, transparent</div></div>
          <div className="grid">
            <div style={{gridColumn:"span 4"}}><Card title="Least access" desc="Client uses anon key only. Scheduled jobs use service role key (server only)." /></div>
            <div style={{gridColumn:"span 4"}}><Card title="Row-level security" desc="Each user sees only their data. Policies are enforced in Supabase." /></div>
            <div style={{gridColumn:"span 4"}}><Card title="Audit trail" desc="Every scheduled run is stored. Alerts include source context." /></div>
          </div>
        </div>

        <div id="pricing" className="section">
          <div className="h2">Pricing</div>
          <div className="grid">
            <div style={{gridColumn:"span 6"}}><div className="card"><div className="cardInner">
              <div className="h3">PRO</div>
              <div style={{fontSize:44,fontWeight:800,margin:"8px 0"}}>€29<span style={{fontSize:14,color:"var(--muted)"}}>/month</span></div>
              <p className="p">Scheduled checks every 10 minutes.</p>
              <hr className="sep"/><div className="row"><a className="btn btnPrimary" href={config.stripeProLink}>Subscribe PRO</a><a className="btn" href="/app">Open dashboard</a></div>
              <div className="small" style={{marginTop:10}}>Promo: {config.promo5} / {config.promo10}</div>
            </div></div></div>
            <div style={{gridColumn:"span 6"}}><div className="card"><div className="cardInner">
              <div className="h3">BUSINESS</div>
              <div style={{fontSize:44,fontWeight:800,margin:"8px 0"}}>€99<span style={{fontSize:14,color:"var(--muted)"}}>/month</span></div>
              <p className="p">Fastest schedule: every minute.</p>
              <hr className="sep"/><div className="row"><a className="btn btnPrimary" href={config.stripeBusinessLink}>Subscribe BUSINESS</a><a className="btn" href="/app">Open dashboard</a></div>
              <div className="small" style={{marginTop:10}}>Promo: {config.promo10}</div>
            </div></div></div>
          </div>
        </div>

        <div id="promo" className="section">
          <div className="h2">Promo codes</div>
          <div className="grid">
            <div style={{gridColumn:"span 6"}}><div className="card"><div className="cardInner"><div className="h3">Welcome €5</div><p className="p">Enter at Stripe checkout:</p><div className="row" style={{marginTop:10}}><code className="btn" style={{userSelect:"all"}}>{config.promo5}</code></div></div></div></div>
            <div style={{gridColumn:"span 6"}}><div className="card"><div className="cardInner"><div className="h3">Referral reward €10</div><p className="p">Enter at Stripe checkout:</p><div className="row" style={{marginTop:10}}><code className="btn" style={{userSelect:"all"}}>{config.promo10}</code></div></div></div></div>
          </div>
        </div>

        <div className="footer"><div className="row" style={{justifyContent:"space-between"}}><div>© {new Date().getFullYear()} VELIOR</div><div className="small">Built for execution — not hype.</div></div></div>
      </div>
    </div>
  );
}
