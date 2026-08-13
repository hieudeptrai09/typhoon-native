import type { ReactNode } from "react";

interface LegendShellProps {
  label: string;
  ariaLabel: string;
  children: ReactNode;
}

export default function LegendShell({ label, ariaLabel, children }: LegendShellProps) {
  return (
    <section className="mt-6 border-t border-slate-200 pt-6" aria-label={ariaLabel}>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:justify-start">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        {children}
      </div>
    </section>
  );
}

interface LegendItemProps {
  label: ReactNode;
  color?: string;
  colorClass?: string;
}

export const LegendItem = ({ label, color, colorClass }: LegendItemProps) => (
  <span className="flex items-center gap-1.5">
    <span
      className={`inline-block h-3 w-3 shrink-0 rounded-sm ${colorClass ? `${colorClass} border border-slate-300` : ""}`}
      style={color ? { backgroundColor: color } : undefined}
      aria-hidden="true"
    />
    <span className="text-xs text-foreground">{label}</span>
  </span>
);
