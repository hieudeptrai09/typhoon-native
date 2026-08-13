import type { DashboardParams } from "@/lib/types";
import { Segmented } from "antd";
import Link from "next/link";
import { DASHBOARD_ICON_MAP, FILTER_OPTIONS, MODE_OPTIONS } from "../../_utils/dashboardOptions";
import {
  isGridOnly,
  isListOnly,
  paramsForFilter,
  paramsForView,
  paramsToPath,
} from "../../_utils/routing";

const VIEW_TABS: { key: string; label: string }[] = [
  { key: "all", label: "Storms" },
  { key: "highlights", label: "Highlights" },
  { key: "average", label: "Average" },
  { key: "recurrence", label: "Recurrence" },
  { key: "avgdate", label: "Avg. Date" },
];

interface DashboardControlBarProps {
  params: DashboardParams;
  onChange: (params: DashboardParams) => void;
}

const DashboardControlBar = ({ params, onChange }: DashboardControlBarProps) => {
  const { view, filter, mode } = params;
  const filterOptions = FILTER_OPTIONS[view] ?? [];

  return (
    <div className="mx-auto mb-6 flex max-w-4xl flex-col gap-4">
      <nav
        aria-label="Dashboard view"
        className="mx-auto grid w-full max-w-2xl grid-cols-5 border-b border-gray-200"
      >
        {VIEW_TABS.map(({ key, label }) => {
          const Icon = DASHBOARD_ICON_MAP.view[key];
          const isActive = view === key;
          return (
            <Link
              key={key}
              href={paramsToPath(paramsForView(key))}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-end gap-1 px-0.5 pb-2.5 text-center text-[11px] leading-tight font-semibold transition-colors sm:flex-row sm:justify-center sm:gap-1.5 sm:px-4 sm:pb-3 sm:text-sm ${
                isActive
                  ? "border-b-2 border-sky-700 text-sky-700"
                  : "text-foreground hover:text-highlight"
              }`}
            >
              <Icon size={15} className="shrink-0" />
              <span className="sm:whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-3">
        <div className="flex flex-col items-center justify-center gap-1.5 sm:flex-row sm:gap-2.5">
          <span className="shrink-0 text-xs font-semibold tracking-widest text-foreground uppercase">
            Group by
          </span>
          <div className="max-w-full overflow-x-auto sm:min-w-0">
            <Segmented
              options={filterOptions}
              value={filter || filterOptions[0]?.value}
              onChange={(v) => onChange(paramsForFilter(view, String(v), mode))}
              aria-label="Select grouping option"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1.5 sm:flex-row sm:gap-2.5">
          <span className="shrink-0 text-xs font-semibold tracking-widest text-foreground uppercase">
            Display as
          </span>
          <div className="max-w-full overflow-x-auto sm:min-w-0">
            <Segmented
              options={MODE_OPTIONS.map((opt) => ({
                ...opt,
                disabled:
                  (opt.value === "table" && isListOnly(view, filter)) ||
                  (opt.value === "list" && isGridOnly(view, filter)),
              }))}
              value={mode}
              onChange={(v) => onChange({ view, filter, mode: String(v) })}
              aria-label="Select display mode"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardControlBar;
