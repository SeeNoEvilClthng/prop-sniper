import { redirect } from "next/navigation";

import ActionButton from "@/components/ui/ActionButton";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { createClient } from "@/lib/supabase/server";

type AppointmentRecord = {
  id: string;
  lead_id?: string | null;
  scheduled_for?: string | null;
  status?: string | null;
  notes?: string | null;
};

type LeadRecord = {
  id: string;
  address?: string | null;
  owner_name?: string | null;
};

export default async function AppointmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: appointments }, { data: leads }] = await Promise.all([
    supabase.from("appointments").select("id, lead_id, scheduled_for, status, notes").order("scheduled_for", { ascending: true }),
    supabase.from("leads").select("id, address, owner_name").eq("user_id", user.id),
  ]);

  const leadMap = new Map(((leads || []) as LeadRecord[]).map((lead) => [lead.id, lead]));
  const appointmentRows = (appointments || []) as AppointmentRecord[];

  return (
    <main className="space-y-5">
      <PageHeader
        eyebrow="Appointments"
        title="Keep the close moving"
        description="Appointments are the handoff after AI qualification. Use this page to track callbacks, booked conversations, and next steps."
        actions={<ActionButton href="/outreach" variant="primary">Open AI Outreach</ActionButton>}
      />

      {appointmentRows.length > 0 ? (
        <section className="space-y-3">
          {appointmentRows.map((appointment) => {
            const lead = leadMap.get(appointment.lead_id || "");
            return (
              <div key={appointment.id} className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{lead?.address || "Lead not found"}</p>
                    <p className="mt-1 text-sm text-slate-400">{lead?.owner_name || "Unknown owner"}</p>
                  </div>
                  <StatusBadge status={appointment.status || "appointment_booked"} />
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Scheduled: {appointment.scheduled_for ? new Date(appointment.scheduled_for).toLocaleString() : "Placeholder only"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {appointment.notes || "No appointment notes yet."}
                </p>
              </div>
            );
          })}
        </section>
      ) : (
        <EmptyState
          title="No appointments booked yet"
          description="When a lead becomes hot or asks for a callback, book the appointment from the lead page or outreach page."
          action={<ActionButton href="/leads?view=pipeline" variant="primary">Open CRM</ActionButton>}
        />
      )}
    </main>
  );
}
