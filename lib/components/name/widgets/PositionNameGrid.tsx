"use client";

import PositionGrid from "@/lib/components/position/PositionGrid";
import type { IconName, TyphoonName } from "@/lib/types";
import { onEnterKeyDown } from "@/lib/utils/a11y";
import { getNameStatusColor } from "@/lib/utils/colors";
import Ionicons from "@expo/vector-icons/Ionicons";

const DEFAULT_COLOR = "#334155";

const TAG_ICONS: Record<string, IconName> = {
  Animal: "paw-outline",
  "Celestial body": "moon-outline",
  Concept: "library-outline",
  Deity: "flash-outline",
  Descriptive: "pricetag-outline",
  "Food and beverage": "fast-food-outline",
  Mineral: "diamond-outline",
  Nature: "cloudy-outline",
  "People's name": "person-outline",
  Place: "location-outline",
  Plant: "leaf-outline",
  Thing: "hammer-outline",
};

const TAG_COLORS: Record<string, string> = {
  Animal: "#047857",
  "Celestial body": "#3730a3",
  Concept: "#6d28d9",
  Deity: "#b45309",
  Descriptive: "#be123c",
  "Food and beverage": "#ef4444",
  Mineral: "#64748b",
  Nature: "#0891b2",
  "People's name": "#db2777",
  Place: "#2563eb",
  Plant: "#16a34a",
  Thing: "#92400e",
};

const HISTORY_COUNT_COLORS = ["", "#16a34a", "#2563eb", "#d97706"];
const getHistoryCountColor = (count: number) =>
  count >= 4 ? "#dc2626" : HISTORY_COUNT_COLORS[count] || DEFAULT_COLOR;

const TagIcon = ({
  tag,
  size = 20,
  colorOverride,
}: {
  tag: string;
  size?: number;
  colorOverride?: string;
}) => {
  const icon = TAG_ICONS[tag];
  if (!icon) return null;
  return (
    <Ionicons name={icon} size={size} color={colorOverride || TAG_COLORS[tag] || DEFAULT_COLOR} />
  );
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
        className="leading-tight font-semibold hover:underline"
        style={{ fontSize: size.name, color: colorOverride || getNameStatusColor(name) }}
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
