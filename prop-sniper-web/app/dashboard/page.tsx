import { redirect } from "next/navigation";

import LeadDiscoveryWorkspace from "@/components/LeadDiscoveryWorkspace";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <LeadDiscoveryWorkspace
      title="Lead Finder Command Center"
      subtitle="Find leads, review them on the map, save the best ones, and move directly into AI outreach."
    />
  );
}
