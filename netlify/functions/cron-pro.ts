import type { Handler } from "@netlify/functions";
import { runDueChecksForPlan } from "./_utils";
export const handler: Handler = async () => {
  try{ const r = await runDueChecksForPlan("PRO"); return { statusCode:200, body: JSON.stringify({ok:true, plan:"PRO", ...r}) }; }
  catch(e:any){ return { statusCode:500, body: JSON.stringify({ok:false, error:e?.message||String(e)}) }; }
};
