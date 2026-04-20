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

  return (
    <div className="space-y-4">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[130px] w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0d1727,#091321)] px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-[#d7bf7c]/40"
      />

      <div className="space-y-2">
        {phones?.map((p, i) => (
          <a
            key={i}
            href={`sms:${typeof p === "string" ? p : p.number}?body=${encodeURIComponent(message)}`}
            onClick={() => logAttempt("sms")}
            className="block rounded-2xl border border-emerald-400/20 bg-emerald-500/12 px-4 py-3 text-center text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/18"
          >
            Text {typeof p === "string" ? p : p.number}
          </a>
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
