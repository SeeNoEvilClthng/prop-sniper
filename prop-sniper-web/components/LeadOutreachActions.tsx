"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ActionButton from "@/components/ui/ActionButton";
import { buildSafeFirstText } from "@/lib/outreach/workflow";

type LeadOutreachActionsProps = {
  leadId: string;
  propertyAddress: string;
  status?: string | null;
  phone?: string | null;
  compact?: boolean;
};

export default function LeadOutreachActions({
  leadId,
  propertyAddress,
  status,
  phone,
  compact = false,
}: LeadOutreachActionsProps) {
  const router = useRouter();
  const [working, setWorking] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const canStartAiCall = status === "replied";
  const isBlocked = status === "do_not_contact" || status === "dead";

  async function sendFirstText() {
    try {
      setWorking("text");
      setNotice("");

      const response = await fetch("/api/outreach/send-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          message: buildSafeFirstText(propertyAddress),
        }),
      });

      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not send text.");
      }

      setNotice(data.message || "First text sent.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not send text.");
    } finally {
      setWorking(null);
    }
  }

  async function startAiCall() {
    try {
      setWorking("call");
      setNotice("");

      const response = await fetch("/api/voice/start-ai-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadId }),
      });

      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not start AI call.");
      }

      setNotice(data.message || "AI call placeholder started.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not start AI call.");
    } finally {
      setWorking(null);
    }
  }

  async function markDoNotContact() {
    try {
      setWorking("dnc");
      setNotice("");

      const response = await fetch("/api/leads/workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          status: "do_not_contact",
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not update status.");
      }

      setNotice("Lead marked do not contact.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update lead.");
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <ActionButton
          size={compact ? "sm" : "md"}
          variant="primary"
          onClick={sendFirstText}
          disabled={working !== null || isBlocked || !phone}
        >
          {working === "text" ? "Sending..." : "Send First Text"}
        </ActionButton>
        <ActionButton
          size={compact ? "sm" : "md"}
          variant="secondary"
          href={`/outreach?lead=${leadId}`}
        >
          View Replies
        </ActionButton>
        <ActionButton
          size={compact ? "sm" : "md"}
          variant="secondary"
          onClick={startAiCall}
          disabled={working !== null || !canStartAiCall || isBlocked}
        >
          {working === "call" ? "Starting..." : "Start AI Call"}
        </ActionButton>
        <ActionButton
          size={compact ? "sm" : "md"}
          variant="ghost"
          href={`/dashboard/${leadId}?tab=ai-notes`}
        >
          View AI Summary
        </ActionButton>
        <ActionButton
          size={compact ? "sm" : "md"}
          variant="secondary"
          href={`/appointments?lead=${leadId}`}
        >
          Book Appointment
        </ActionButton>
        <ActionButton
          size={compact ? "sm" : "md"}
          variant="danger"
          onClick={markDoNotContact}
          disabled={working !== null || isBlocked}
        >
          {working === "dnc" ? "Updating..." : "Mark Do Not Contact"}
        </ActionButton>
      </div>

      {notice ? <p className="text-xs text-slate-400">{notice}</p> : null}
      {!canStartAiCall && !isBlocked ? (
        <p className="text-xs text-slate-500">
          AI calls stay locked until the seller replies with interest.
        </p>
      ) : null}
    </div>
  );
}
