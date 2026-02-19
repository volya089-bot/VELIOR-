import type { Handler } from "@netlify/functions";
import { runDueChecksForPlan } from "./_utils";
export const handler: Handler = async () => {
  try{ const r = await runDueChecksForPlan("BUSINESS"); return { statusCode:200, body: JSON.stringify({ok:true, plan:"BUSINESS", ...r}) }; }
  catch(e:any){ return { statusCode:500, body: JSON.stringify({ok:false, error:e?.message||String(e)}) }; }
};
