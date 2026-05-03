"use client";

type ScoreRingProps = {
  score?: number | null;
  label?: string;
  size?: number;
};

function getTone(score: number) {
  if (score >= 80) return { stroke: "#22c55e", glow: "0 0 22px rgba(34,197,94,0.35)" };
  if (score >= 60) return { stroke: "#a855f7", glow: "0 0 22px rgba(168,85,247,0.35)" };
  if (score >= 40) return { stroke: "#f59e0b", glow: "0 0 22px rgba(245,158,11,0.35)" };
  return { stroke: "#f43f5e", glow: "0 0 22px rgba(244,63,94,0.35)" };
}

export default function ScoreRing({
  score = 0,
  label = "Deal Score",
  size = 96,
}: ScoreRingProps) {
  const normalized = Math.max(0, Math.min(100, score || 0));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (normalized / 100) * circumference;
  const tone = getTone(normalized);

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox="0 0 96 96" className="rotate-[-90deg]">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={tone.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            filter: `drop-shadow(${tone.glow})`,
            transition: "stroke-dashoffset 500ms ease, stroke 300ms ease",
          }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-white">{normalized}</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
          {label}
        </span>
      </div>
    </div>
  );
}
