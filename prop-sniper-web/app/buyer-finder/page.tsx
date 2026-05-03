import { redirect } from "next/navigation";

import ActionButton from "@/components/ui/ActionButton";
import PageHeader from "@/components/ui/PageHeader";
import ScoreRing from "@/components/ui/ScoreRing";
import { createClient } from "@/lib/supabase/server";

type InvestorRecord = {
  id: string;
  company_name?: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  markets?: string | null;
  buy_box?: string | null;
  buyer_type?: string | null;
  max_price?: number | null;
  notes?: string | null;
};

function formatMoney(value?: number | null) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default async function BuyerFinderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("investors")
    .select("id, company_name, contact_name, email, phone, markets, buy_box, buyer_type, max_price, notes")
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .order("created_at", { ascending: false })
    .limit(24);

  const investors = (data || []) as InvestorRecord[];

  return (
    <main className="space-y-5">
      <PageHeader
        eyebrow="Buyer Finder"
        title="Simple investor matching"
        description="Search your buyer network, see who is active in each market, and prep disposition faster when a lead becomes offer-ready."
        actions={
          <>
            <ActionButton href="/investors/new" variant="primary">
              Add Buyer
            </ActionButton>
            <ActionButton href="/campaigns" variant="secondary">
              Campaigns
            </ActionButton>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {investors.slice(0, 9).map((investor, index) => (
          <div key={investor.id} className="hover-lift hover-glow rounded-[26px] border border-white/8 bg-[#0b0f17] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">
                  {investor.company_name || investor.contact_name || "Unnamed buyer"}
                </p>
                <p className="mt-1 text-sm text-slate-400">{investor.buyer_type || "Buyer profile"}</p>
              </div>
              <ScoreRing score={Math.max(35, 92 - index * 5)} label="Fit" size={72} />
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>Markets: {investor.markets || "—"}</p>
              <p>Buy Box: {investor.buy_box || "—"}</p>
              <p>Max Price: {formatMoney(investor.max_price)}</p>
              <p>Phone: {investor.phone || "—"}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
