"use client";

import PositionGrid from "@/lib/components/PositionGrid";
import type { TyphoonName } from "@/lib/types";
import { onEnterKeyDown } from "@/lib/utils/a11y";
import { getNameStatusColorClass } from "@/lib/utils/colors";
import {
  Gem,
  Ham,
  Hammer,
  Leaf,
  LibraryBig,
  MapPin,
  Moon,
  PawPrint,
  Swords,
  Tag,
  User,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TAG_ICONS: Record<string, LucideIcon> = {
  Animal: PawPrint,
  "Celestial body": Moon,
  Concept: LibraryBig,
  Deity: Swords,
  Descriptive: Tag,
  "Food and beverage": Ham,
  Mineral: Gem,
  Nature: Wind,
  "People's name": User,
  Place: MapPin,
  Plant: Leaf,
  Thing: Hammer,
};

const TAG_COLORS: Record<string, string> = {
  Animal: "text-emerald-700",
  "Celestial body": "text-indigo-800",
  Concept: "text-violet-700",
  Deity: "text-amber-700",
  Descriptive: "text-rose-700",
  "Food and beverage": "text-red-500",
  Mineral: "text-slate-500",
  Nature: "text-cyan-600",
  "People's name": "text-pink-600",
  Place: "text-blue-600",
  Plant: "text-green-600",
  Thing: "text-amber-800",
};

const HISTORY_COUNT_COLORS = ["", "text-green-600", "text-blue-600", "text-amber-600"];
const getHistoryCountColor = (count: number) =>
  count >= 4 ? "text-red-600" : HISTORY_COUNT_COLORS[count] || "text-foreground";

const TagIcon = ({
  tag,
  size = 20,
  colorOverride,
}: {
  tag: string;
  size?: number;
  colorOverride?: string;
}) => {
  const Icon = TAG_ICONS[tag];
  const colorClass = colorOverride || TAG_COLORS[tag] || "text-foreground";
  if (!Icon) return null;
  return <Icon size={size} className={colorClass} />;
};

const sortByOldest = (names: TyphoonName[]) => [...names].sort((a, b) => a.id - b.id);

const CELL_SIZE = {
  current: { name: 14, icon: 20 },
  history: { name: 12, icon: 15 },
} as const;

const NameButton = ({
  name,
  size,
  showName,
  onNameClick,
  colorOverride,
}: {
  name: TyphoonName;
  size: { name: number; icon: number };
  showName: boolean;
  onNameClick: (n: TyphoonName) => void;
  colorOverride?: string;
}) => (
  <button
    title={name.name}
    aria-label={`View details for ${name.name}`}
    onClick={(e) => {
      e.stopPropagation();
      onNameClick(name);
    }}
    className="flex min-h-11 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0.5 hover:bg-stone-100 md:min-h-0"
  >
    {showName ? (
      <span
        className={`leading-tight font-semibold ${colorOverride || getNameStatusColorClass(name)} hover:underline`}
        style={{ fontSize: size.name }}
      >
        {name.name}
      </span>
    ) : (
      <TagIcon tag={name.tag} size={size.icon} colorOverride={colorOverride} />
    )}
  </button>
);

const CellContent = ({
  names,
  showHistory,
  showName,
  colorfulHistory,
  onNameClick,
}: {
  names: TyphoonName[];
  showHistory: boolean;
  showName: boolean;
  colorfulHistory: boolean;
  onNameClick: (n: TyphoonName) => void;
}) => {
  if (showHistory) {
    const colorOverride = colorfulHistory ? getHistoryCountColor(names.length) : undefined;
    return (
      <div className="flex min-h-16 flex-col items-center justify-center gap-0 py-4 md:py-1 md:gap-0.5">
        {names.length === 0 ? (
          <span className="text-xs text-gray-300">—</span>
        ) : (
          sortByOldest(names).map((n) => (
            <NameButton
              key={n.id}
              name={n}
              size={CELL_SIZE.history}
              showName={showName}
              onNameClick={onNameClick}
              colorOverride={colorOverride}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-16 items-center justify-center p-1">
      {names.length > 0 ? (
        <NameButton
          name={names[0]}
          size={CELL_SIZE.current}
          showName={showName}
          onNameClick={onNameClick}
        />
      ) : (
        <span className="text-xs text-gray-300">—</span>
      )}
    </div>
  );
};

interface PositionNameGridProps {
  names: TyphoonName[];
  showName: boolean;
  showHistory: boolean;
  colorfulHistory?: boolean;
  onNameClick: (name: TyphoonName) => void;
  onCellClick: (position: number, names: TyphoonName[]) => void;
}

const PositionNameGrid = ({
  names,
  showName,
  showHistory,
  colorfulHistory = false,
  onNameClick,
  onCellClick,
}: PositionNameGridProps) => {
  const namesByPosition = names.reduce<Record<number, TyphoonName[]>>((acc, n) => {
    if (n.retirementReason === "misspell") return acc;
    if (!acc[n.position]) acc[n.position] = [];
    acc[n.position].push(n);
    return acc;
  }, {});

  return (
    <div>
      <PositionGrid
        renderCell={(position, _row, col) => {
          const positionNames = namesByPosition[position] ?? [];
          const isEmpty = positionNames.length === 0;

          return (
            <td
              key={col}
              className={`border border-stone-300 p-0 transition-colors ${
                isEmpty ? "cursor-default bg-gray-100" : "cursor-pointer hover:bg-stone-100"
              }`}
              role={!isEmpty ? "button" : ""}
              tabIndex={!isEmpty ? 0 : -1}
              aria-label={`Position ${position}`}
              onClick={() => {
                if (positionNames.length === 0) return;
                onCellClick(position, positionNames);
              }}
              onKeyDown={onEnterKeyDown(() => {
                if (positionNames.length === 0) return;
                onCellClick(position, positionNames);
              })}
            >
              <CellContent
                names={positionNames}
                showHistory={showHistory}
                showName={showName}
                colorfulHistory={showHistory && colorfulHistory}
                onNameClick={onNameClick}
              />
            </td>
          );
        }}
      />

      {!showName && (
        <div className="max-w-8xl mx-auto mt-6">
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(TAG_ICONS).map(([tag]) => (
              <div key={tag} className="flex items-center gap-1.5">
                <TagIcon tag={tag} size={14} />
                <span className="text-xs text-foreground">{tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionNameGrid;
