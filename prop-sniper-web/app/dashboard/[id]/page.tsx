import ContactActions from "@/components/ContactActions";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DealAnalyzer from "@/components/DealAnalyzer";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (leadError || !lead) {
    return (
      <div className="p-6">
        <Link href="/dashboard" className="text-blue-600 underline">
          Back to Dashboard
        </Link>
        <p className="mt-4 text-red-600">Lead not found.</p>
      </div>
    );
  }

  const { data: contactAttempts, error: attemptsError } = await supabase
    .from("contact_attempts")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 p-6">
      <div>
        <Link href="/dashboard" className="text-blue-600 underline">
          Back to Dashboard
        </Link>
      </div>

      <div className="rounded-2xl border p-6">
        <h1 className="text-2xl font-bold">{lead.address || "No address"}</h1>
        <p className="text-gray-600">
          {[lead.city, lead.state, lead.zip].filter(Boolean).join(", ") || "No location"}
        </p>
      </div>

      <div className="rounded-2xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">Lead Info</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Owner Name</p>
            <p>{lead.owner_name || "No owner saved"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p>{lead.status || "No status"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Estimated Value</p>
            <p>
              {lead.estimated_value
                ? `$${Number(lead.estimated_value).toLocaleString()}`
                : "No value yet"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Estimated Rent</p>
            <p>
              {lead.estimated_rent
                ? `$${Number(lead.estimated_rent).toLocaleString()}`
                : "No rent yet"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Beds / Baths</p>
            <p>
              {lead.beds || "—"} / {lead.baths || "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Square Feet</p>
            <p>{lead.sqft ? Number(lead.sqft).toLocaleString() : "—"}</p>
          </div>
        </div>
      </div>
      <DealAnalyzer
  sqft={lead.sqft}
  estimatedValue={lead.estimated_value}
/>


      <div className="rounded-2xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">Outreach</h2>
        <ContactActions
          leadId={lead.id}
          phones={Array.isArray(lead.owner_phones) ? lead.owner_phones : []}
          emails={Array.isArray(lead.owner_emails) ? lead.owner_emails : []}
        />
      </div>

      <div className="rounded-2xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">Contact History</h2>

        {attemptsError ? (
          <p className="text-red-600">Could not load contact history.</p>
        ) : contactAttempts && contactAttempts.length > 0 ? (
          <div className="space-y-3">
            {contactAttempts.map((attempt) => (
              <div key={attempt.id} className="rounded-xl border p-3">
                <p className="font-medium">
                  {attempt.method?.toUpperCase() || "UNKNOWN"} •{" "}
                  {attempt.status || "sent"}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {attempt.message || "No message saved"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {attempt.created_at
                    ? new Date(attempt.created_at).toLocaleString()
                    : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No contact attempts yet.</p>
        )}
      </div>
    </div>
  );
}