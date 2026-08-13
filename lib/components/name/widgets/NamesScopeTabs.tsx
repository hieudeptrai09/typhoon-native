import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import Link from "next/link";

export type NamesScope = "current" | "history" | "retired";

const TABS: { key: NamesScope; label: string; icon: IconName }[] = [
  { key: "current", label: "Current", icon: "flame-outline" },
  { key: "history", label: "History", icon: "time-outline" },
  { key: "retired", label: "Retired", icon: "skull-outline" },
];

interface NamesScopeTabsProps {
  activeScope: NamesScope;
  hrefs: Record<NamesScope, string>;
}

const NamesScopeTabs = ({ activeScope, hrefs }: NamesScopeTabsProps) => (
  <nav aria-label="Name scope" className="mx-auto mb-6 flex max-w-md border-b border-gray-200">
    {TABS.map(({ key, label, icon }) => {
      const isActive = activeScope === key;
      return (
        <Link
          key={key}
          href={hrefs[key]}
          aria-current={isActive ? "page" : undefined}
          className={`flex flex-1 items-center justify-center gap-1.5 px-4 pb-3 text-sm font-semibold whitespace-nowrap transition-colors ${
            isActive
              ? "border-b-2 border-sky-700 text-sky-700"
              : "text-foreground hover:text-highlight"
          }`}
        >
          <Ionicons name={icon} size={15} color={isActive ? "#0369a1" : "#334155"} />
          {label}
        </Link>
      );
    })}
  </nav>
);

export default NamesScopeTabs;
