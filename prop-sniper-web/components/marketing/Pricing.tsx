"use client";
import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { CTA_LABEL, SITE } from "@/lib/site";
const plans = [
  { name:"Starter", price:SITE.starterPrice, description:"For solo wholesalers.", features:["Map and city finder", "Lead pipeline and scoring", "Deal estimates, notes, and tasks"], available:true },
  { name:"Pro", price:79, description:"Planned for active acquisitions.", features:["Plan details awaiting confirmation"], available:false },
  { name:"Team", price:149, description:"Planned for small teams.", features:["Plan details awaiting confirmation"], available:false },
];
export default function Pricing(){
 const [annual,setAnnual]=useState(false);
 return <section id="pricing" className="ps-section" aria-labelledby="pricing-title"><div className="ps-wrap">
 <h2 id="pricing-title" className="ps-h2">Start with your next lead.</h2>
 <p className="ps-lead">Starter: {SITE.trialDays} days free, then ${SITE.starterPrice}/month. Card required.</p>
 <div className="ps-billing" role="group" aria-label="Billing period"><button type="button" aria-pressed={!annual} onClick={()=>setAnnual(false)}>Monthly</button><button type="button" aria-pressed={annual} onClick={()=>setAnnual(true)}>Annual � save 20%</button></div>
 <p className="ps-billing-note" role="status">{annual?"Annual pricing preview. Annual checkout is not available yet.":"Monthly Starter checkout is available. Pro and Team prices are proposed."}</p>
 <div className="ps-plans">{plans.map(plan=><article key={plan.name} className={`ps-plan ${plan.name==="Pro"?"ps-plan-recommended":""}`}><div className="ps-plan-top"><h3>{plan.name}</h3>{plan.name==="Pro"&&<span className="ps-badge">Recommended*</span>}</div>
 <div className="ps-price"><strong>${annual?(plan.price*.8).toFixed(2):plan.price}</strong><span>/month</span></div>
 {annual&&<p className="ps-plan-note">${(plan.price*12*.8).toFixed(2)} billed annually when available.</p>}
 <p className="ps-plan-desc">{plan.description}</p><ul className="ps-checks">{plan.features.map(f=><li key={f}><Check aria-hidden="true"/><span>{f}</span></li>)}</ul>
 <div className="ps-plan-foot">{plan.available&&!annual?<Link href="/signup" className="ps-btn ps-btn-primary ps-btn-block">{CTA_LABEL}</Link>:<p className="ps-plan-note">{annual?"Annual checkout coming soon":"Plan not available at checkout"}</p>}</div></article>)}</div>
 <p className="ps-billing-note">*Our recommendation for the planned lineup, not a claim about customer popularity. Pro and Team pricing and features must be confirmed before launch.</p>
 </div></section>;
}
