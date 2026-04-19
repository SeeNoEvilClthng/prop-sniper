"use client";

import { useState } from "react";

type Phone = {
  number?: string;
};

type Props = {
  leadId: string;
  phones: Phone[];
  emails: { email?: string }[];
};

export default function ContactActions({ leadId, phones, emails }: Props) {
  const [message, setMessage] = useState(
    "Hi, I’m interested in your property. Are you open to selling?"
  );

  async function logAttempt(method: string) {
    await fetch("/api/contact/log", {
      method: "POST",
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
        className="w-full border rounded-xl p-2"
      />

      <div className="space-y-2">
        {phones?.map((p, i) => (
          <a
            key={i}
            href={`sms:${p.number}?body=${encodeURIComponent(message)}`}
            onClick={() => logAttempt("sms")}
            className="block bg-green-600 text-white px-3 py-2 rounded-xl text-center"
          >
            Text {p.number}
          </a>
        ))}
      </div>

      <div className="space-y-2">
        {emails?.map((e, i) => (
          <a
            key={i}
            href={`mailto:${e.email}?subject=Property Inquiry&body=${encodeURIComponent(message)}`}
            onClick={() => logAttempt("email")}
            className="block bg-blue-600 text-white px-3 py-2 rounded-xl text-center"
          >
            Email {e.email}
          </a>
        ))}
      </div>
    </div>
  );
}