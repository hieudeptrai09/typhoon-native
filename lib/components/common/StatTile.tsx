import type { ReactNode } from "react";

const StatTile = ({
  label,
  title,
  children,
}: {
  label: string;
  title?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col rounded-md bg-slate-50 px-3 py-2" title={title}>
    <span className="text-sm text-foreground">{label}</span>
    <span className="text-lg font-bold whitespace-nowrap tabular-nums">{children}</span>
  </div>
);

export default StatTile;
