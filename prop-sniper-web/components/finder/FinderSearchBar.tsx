"use client";

type Props = {
  city: string;
  setCity: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
};

export default function FinderSearchBar({
  city,
  setCity,
  onSearch,
  loading,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search a city like Houston, Phoenix, Memphis..."
          className="flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-white placeholder:text-white/35 outline-none focus:border-cyan-400/50"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
        />

        <button
          onClick={onSearch}
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? "Finding..." : "Find Deals"}
        </button>
      </div>
    </div>
  );
}