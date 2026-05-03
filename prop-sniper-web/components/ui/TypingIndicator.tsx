"use client";

export default function TypingIndicator({
  label = "AI is thinking",
}: {
  label?: string;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-violet-400/16 bg-violet-500/10 px-3 py-2 text-xs text-violet-100">
      <span>{label}</span>
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-200 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-200 [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-200 [animation-delay:240ms]" />
      </span>
    </div>
  );
}
