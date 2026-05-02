import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  helper?: string;
  actions?: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  helper,
  actions,
}: PageHeaderProps) {
  return (
    <section className="rounded-3xl border border-white/8 bg-[#0b0f17] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] uppercase tracking-[0.26em] text-violet-200/80">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
          ) : null}
          {helper ? (
            <p className="mt-3 text-sm font-medium text-slate-300">{helper}</p>
          ) : null}
        </div>

        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
