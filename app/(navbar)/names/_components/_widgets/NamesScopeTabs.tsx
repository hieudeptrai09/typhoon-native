import { Flame, History, Skull } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export type NamesScope = "current" | "history" | "retired";

const TABS: { key: NamesScope; label: string; icon: LucideIcon }[] = [
  { key: "current", label: "Current", icon: Flame },
  { key: "history", label: "History", icon: History },
  { key: "retired", label: "Retired", icon: Skull },
];

interface NamesScopeTabsProps {
  activeScope: NamesScope;
  hrefs: Record<NamesScope, string>;
}

const NamesScopeTabs = ({ activeScope, hrefs }: NamesScopeTabsProps) => (
  <nav aria-label="Name scope" className="mx-auto mb-6 flex max-w-md border-b border-gray-200">
    {TABS.map(({ key, label, icon: Icon }) => {
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
          <Icon size={15} />
          {label}
        </Link>
      );
    })}
  </nav>
);

export default NamesScopeTabs;
