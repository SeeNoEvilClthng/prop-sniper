"use client";

import { useMemo, useState } from "react";

import { buildSafeFirstText } from "@/lib/outreach/workflow";

type Phone = {
  number?: string;
};

type Props = {
  leadId: string;
  phones: Array<Phone | string>;
  emails: Array<{ email?: string } | string>;
  propertyAddress?: string;
  currentStatus?: string | null;
};

function normalizePhone(value?: string) {
  return (value || "").trim();
}

export default function ContactActions({
  leadId,
  phones,
  emails,
  propertyAddress,
  currentStatus,
}: Props) {
  const primaryPhone = useMemo(
    () =>
      normalizePhone(
        typeof phones?.[0] === "string" ? phones[0] : phones?.[0]?.number
      ),
    [phones]
  );

  const [message, setMessage] = useState(
    buildSafeFirstText(propertyAddress || "the property")
  );
  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const isBlocked =
    currentStatus === "do_not_contact" || currentStatus === "dead";

  async function logAttempt(method: string) {
    await fetch("/api/contact/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lead_id: leadId,
        method,
        message,
        status: "sent",
      }),
    });
  }

  async function generateFirstContact() {
    try {
      setIsGenerating(true);
      setStatus("");

      const res = await fetch("/api/contact/generate-first-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadId }),
      });

      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate message");
      }

      setMessage(data.message || buildSafeFirstText(propertyAddress || "the property"));
      setStatus("First-contact text generated for this seller.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to generate message.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function sendSms() {
    try {
      if (!primaryPhone) {
        throw new Error("No phone number available for this lead.");
      }

      setIsSending(true);
      setStatus("");

      const res = await fetch("/api/outreach/send-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          message,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        preview?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Failed to send text");
      }

      setStatus(
        data.preview
          ? data.message || "Twilio is not configured yet."
          : data.message || `Text sent to ${primaryPhone}.`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to send text.");
    } finally {
      setIsSending(false);
    }
  }

  async function updateLeadStatus(nextStatus: "dead" | "do_not_contact") {
    try {
      setIsUpdatingStatus(nextStatus);
      setStatus("");

      const res = await fetch("/api/leads/workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          status: nextStatus,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to update lead status.");
      }

      setStatus(
        nextStatus === "dead"
          ? "Lead marked dead."
          : "Lead marked do not contact."
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to update lead status.");
    } finally {
      setIsUpdatingStatus(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-400/16 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-100">
        AI calling only starts after a seller replies with interest or consent. PropSniper will not cold-call random owners.
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generateFirstContact}
          disabled={isGenerating || isBlocked}
          className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/12 px-4 py-3 text-sm font-semibold text-fuchsia-200 transition hover:bg-fuchsia-500/18 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGenerating ? "Generating..." : "Generate First Contact"}
        </button>
        <button
          type="button"
          onClick={sendSms}
          disabled={isSending || isBlocked || !primaryPhone}
          className="rounded-2xl border border-emerald-400/20 bg-emerald-500/12 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/18 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSending ? "Sending..." : "Send Text"}
        </button>
        {primaryPhone ? (
          <a
            href={`tel:${primaryPhone}`}
            onClick={() => void logAttempt("call")}
            className="rounded-2xl border border-sky-400/20 bg-sky-500/12 px-4 py-3 text-sm font-semibold text-sky-300 transition hover:bg-sky-500/18"
          >
            Call Manually
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => void updateLeadStatus("dead")}
          disabled={isUpdatingStatus !== null}
          className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isUpdatingStatus === "dead" ? "Updating..." : "Mark Dead"}
        </button>
        <button
          type="button"
          onClick={() => void updateLeadStatus("do_not_contact")}
          disabled={isUpdatingStatus !== null}
          className="rounded-2xl border border-rose-400/20 bg-rose-500/12 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/18 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isUpdatingStatus === "do_not_contact" ? "Updating..." : "Do Not Contact"}
        </button>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[130px] w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0d1727,#091321)] px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-[#d7bf7c]/40"
      />

      {status ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          {status}
        </p>
      ) : null}

      <div className="space-y-2">
        {primaryPhone ? (
          <a
            href={`sms:${primaryPhone}?body=${encodeURIComponent(message)}`}
            onClick={() => void logAttempt("sms")}
            className="block rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            Open SMS App
          </a>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
            Add a seller phone number to enable SMS outreach.
          </div>
        )}
      </div>

      <div className="space-y-2">
        {emails?.map((emailEntry, index) => {
          const email = typeof emailEntry === "string" ? emailEntry : emailEntry.email;
          if (!email) return null;

          return (
            <a
              key={`${email}-${index}`}
              href={`mailto:${email}?subject=Property Inquiry&body=${encodeURIComponent(message)}`}
              onClick={() => void logAttempt("email")}
              className="block rounded-2xl border border-sky-400/20 bg-sky-500/12 px-4 py-3 text-center text-sm font-semibold text-sky-300 transition hover:bg-sky-500/18"
            >
              Email {email}
            </a>
          );
        })}
      </div>
    </div>
  );
}
