"use client";

import { useState } from "react";

type Phone = {
  number?: string;
};

type Props = {
  leadId: string;
  phones: Array<Phone | string>;
  emails: Array<{ email?: string } | string>;
};

export default function ContactActions({ leadId, phones, emails }: Props) {
  const [message, setMessage] = useState(
    "Hi, I’m interested in your property. Are you open to selling?"
  );
  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

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

      if (data.message) {
        setMessage(data.message);
        setStatus("First-contact text generated from this property.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to generate message.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function sendSms(number: string) {
    try {
      if (!number) {
        throw new Error("No phone number available for this lead.");
      }

      setSendingTo(number);
      setStatus("");

      const res = await fetch("/api/contact/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          to: number,
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
          ? data.message || "SMS provider not configured yet."
          : data.message || `Text sent to ${number}.`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to send text.");
    } finally {
      setSendingTo(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generateFirstContact}
          disabled={isGenerating}
          className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/12 px-4 py-3 text-sm font-semibold text-fuchsia-200 transition hover:bg-fuchsia-500/18 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGenerating ? "Generating..." : "Generate First Contact"}
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
        {phones?.map((p, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-[1fr_auto]">
            <button
              type="button"
              onClick={() => sendSms(typeof p === "string" ? p : p.number || "")}
              disabled={sendingTo === (typeof p === "string" ? p : p.number)}
              className="rounded-2xl border border-emerald-400/20 bg-emerald-500/12 px-4 py-3 text-center text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/18 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {sendingTo === (typeof p === "string" ? p : p.number)
                ? `Sending to ${typeof p === "string" ? p : p.number}...`
                : `Send Text to ${typeof p === "string" ? p : p.number}`}
            </button>

            <a
              href={`sms:${typeof p === "string" ? p : p.number}?body=${encodeURIComponent(message)}`}
              onClick={() => logAttempt("sms")}
              className="block rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Open SMS App
            </a>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {emails?.map((e, i) => (
          <a
            key={i}
            href={`mailto:${typeof e === "string" ? e : e.email}?subject=Property Inquiry&body=${encodeURIComponent(message)}`}
            onClick={() => logAttempt("email")}
            className="block rounded-2xl border border-sky-400/20 bg-sky-500/12 px-4 py-3 text-center text-sm font-semibold text-sky-300 transition hover:bg-sky-500/18"
          >
            Email {typeof e === "string" ? e : e.email}
          </a>
        ))}
      </div>
    </div>
  );
}
