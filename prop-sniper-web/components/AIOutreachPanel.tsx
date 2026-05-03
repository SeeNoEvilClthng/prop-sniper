"use client";

import { useState } from "react";

import ActionButton from "@/components/ui/ActionButton";
import StatusBadge from "@/components/ui/StatusBadge";
import TypingIndicator from "@/components/ui/TypingIndicator";

type OutreachLead = {
  id: string;
  address: string;
  ownerName?: string | null;
  phone?: string | null;
  status?: string | null;
  aiSummary?: string | null;
};

type AIOutreachPanelProps = {
  open: boolean;
  onClose: () => void;
  lead: OutreachLead | null;
};

export default function AIOutreachPanel({
  open,
  onClose,
  lead,
}: AIOutreachPanelProps) {
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [working, setWorking] = useState<"generate" | "send" | "call" | null>(null);

  async function generateText() {
    if (!lead) return;
    try {
      setWorking("generate");
      setFeedback("");
      const response = await fetch("/api/contact/generate-first-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not generate text.");
      setMessage(data.message || "");
      setFeedback("First-contact text generated.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not generate text.");
    } finally {
      setWorking(null);
    }
  }

  async function sendText() {
    if (!lead) return;
    try {
      setWorking("send");
      setFeedback("");
      const response = await fetch("/api/outreach/send-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, message }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not send text.");
      setFeedback(data.message || "Text sent.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not send text.");
    } finally {
      setWorking(null);
    }
  }

  async function startCall() {
    if (!lead) return;
    try {
      setWorking("call");
      setFeedback("");
      const response = await fetch("/api/voice/start-ai-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not start AI call.");
      setFeedback(data.message || "AI call started.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not start AI call.");
    } finally {
      setWorking(null);
    }
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close AI outreach panel"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      ) : null}

      <aside
        className={`fixed bottom-0 right-0 top-0 z-50 w-full max-w-[440px] border-l border-[#2A2A2A] bg-[#121212] shadow-[0_0_40px_rgba(0,0,0,0.45)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8B5CF6]">
                AI Outreach
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {lead ? lead.address : "Select a saved lead"}
              </h2>
              <p className="mt-1 text-sm text-[#A1A1AA]">
                {lead ? `${lead.ownerName || "Unknown owner"} • ${lead.phone || "No phone"}` : "Save a lead first, then open AI Outreach."}
              </p>
            </div>
            <ActionButton variant="ghost" size="sm" onClick={onClose}>
              Close
            </ActionButton>
          </div>

          {lead ? (
            <div className="mt-5 flex-1 space-y-4 overflow-y-auto">
              <div className="rounded-xl border border-[#2A2A2A] bg-[#1F1F1F] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">Selected lead</p>
                  <StatusBadge status={lead.status} />
                </div>
                <p className="mt-3 text-sm leading-6 text-[#A1A1AA]">
                  {lead.aiSummary || "Use Generate Text to create the first safe outreach message, then wait for a seller reply before starting an AI call."}
                </p>
              </div>

              {working === "generate" ? <TypingIndicator label="Generating outreach text" /> : null}

              <div className="space-y-3 rounded-xl border border-[#2A2A2A] bg-[#1F1F1F] p-4">
                <label className="block text-xs uppercase tracking-[0.18em] text-[#A1A1AA]">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Generate a first-contact seller text"
                  className="min-h-[140px] w-full rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-all duration-300 focus:border-[#7C3AED]/40"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <ActionButton variant="primary" onClick={generateText} disabled={working !== null}>
                  {working === "generate" ? "Generating..." : "Generate Text"}
                </ActionButton>
                <ActionButton variant="secondary" onClick={sendText} disabled={working !== null || !message.trim()}>
                  {working === "send" ? "Sending..." : "Send Text"}
                </ActionButton>
                <ActionButton variant="secondary" onClick={startCall} disabled={working !== null || lead.status !== "replied"}>
                  {working === "call" ? "Starting..." : "Start Call"}
                </ActionButton>
                <ActionButton href={`/ai-agent?lead=${lead.id}`} variant="secondary" className="w-full">
                  Qualify Seller
                </ActionButton>
                <ActionButton href={`/appointments?lead=${lead.id}`} variant="secondary" className="w-full">
                  Book Appointment
                </ActionButton>
                <ActionButton href={`/dashboard/${lead.id}`} variant="ghost" className="w-full">
                  View Details
                </ActionButton>
              </div>

              {lead.status !== "replied" ? (
                <div className="rounded-xl border border-[#2A2A2A] bg-[#1F1F1F] p-4 text-sm leading-6 text-[#A1A1AA]">
                  AI calling stays locked until the seller replies with interest.
                </div>
              ) : null}

              {feedback ? (
                <div className="rounded-xl border border-[#2A2A2A] bg-[#1F1F1F] p-4 text-sm text-white">
                  {feedback}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-[#2A2A2A] bg-[#1F1F1F] p-6 text-sm leading-6 text-[#A1A1AA]">
              Save a lead from the Finder workspace, then use this panel to generate the first text, send it, and move the seller into AI qualification.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
