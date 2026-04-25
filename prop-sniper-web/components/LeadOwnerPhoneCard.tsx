"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Props = {
  leadId: string;
  currentPhone?: string | null;
};

export default function LeadOwnerPhoneCard({ leadId, currentPhone }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [phone, setPhone] = useState(currentPhone || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");

      const { error } = await supabase
        .from("leads")
        .update({
          owner_phone: phone.trim() || null,
        })
        .eq("id", leadId);

      if (error) {
        throw new Error(error.message);
      }

      setMessage("Owner phone saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save phone.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <h2 className="text-2xl font-semibold tracking-[-0.03em]">Owner Phone</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Save or update the seller’s number here without leaving the workspace.
      </p>

      <div className="mt-5 space-y-3">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter owner phone number"
          className="w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0d1727,#091321)] px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-400/40"
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-2xl bg-[linear-gradient(135deg,#9333ea,#6d28d9)] px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save Phone"}
        </button>

        {message ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
