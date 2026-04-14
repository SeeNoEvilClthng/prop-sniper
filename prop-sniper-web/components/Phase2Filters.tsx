type Props = {
  canUsePhase2Filters: boolean;
};

export default function Phase2Filters({ canUsePhase2Filters }: Props) {
  if (!canUsePhase2Filters) {
    return (
      <div className="rounded-lg border p-4">
        <p className="font-semibold">Locked Filters</p>
        <p className="text-sm text-gray-600">
          Pre-foreclosure, foreclosure, and tax lien filters require Pro access.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <label className="flex items-center gap-2">
        <input type="checkbox" name="isPreforeclosure" />
        <span>Pre-Foreclosure</span>
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="isForeclosure" />
        <span>Foreclosure</span>
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="hasTaxLien" />
        <span>Tax Lien</span>
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="isTaxDelinquent" />
        <span>Tax Delinquent</span>
      </label>
    </div>
  );
}