"use client";

type Props = {
  absentee: boolean;
  vacant: boolean;
  highEquity: boolean;
  sort: string;
  setAbsentee: (value: boolean) => void;
  setVacant: (value: boolean) => void;
  setHighEquity: (value: boolean) => void;
  setSort: (value: string) => void;
};

function Pill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-200"
          : "border-white/10 bg-black/20 text-white/70 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

export default function FinderFilterBar({
  absentee,
  vacant,
  highEquity,
  sort,
  setAbsentee,
  setVacant,
  setHighEquity,
  setSort,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-3">
          <Pill
            active={absentee}
            onClick={() => setAbsentee(!absentee)}
            label="Absentee Owner"
          />
          <Pill active={vacant} onClick={() => setVacant(!vacant)} label="Vacant" />
          <Pill
            active={highEquity}
            onClick={() => setHighEquity(!highEquity)}
            label="High Equity"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
        >
          <option value="score_desc">Sort by Score</option>
          <option value="value_desc">Sort by Value</option>
          <option value="rent_desc">Sort by Rent</option>
        </select>
      </div>
    </div>
  );
}