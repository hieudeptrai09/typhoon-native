import type { Storm } from "@/lib/types";
import { SPECIAL_POSITIONS } from "@/lib/utils/position";
import { sortNamesByFirstYear } from "@/lib/utils/storms";
import { Button } from "antd";
import type { ReactNode } from "react";

interface SpecialNamesListDivProps {
  stormsData: Storm[];
  onNameClick: (name: string, storms: Storm[]) => void;
  nameColors?: Record<string, string>;
  nameSubtitles?: Record<string, ReactNode>;
}

const SpecialNamesListDiv = ({
  stormsData,
  onNameClick,
  nameColors,
  nameSubtitles,
}: SpecialNamesListDivProps) => {
  const stormsByPosition = SPECIAL_POSITIONS.map(({ id, label }) => {
    const positionStorms = stormsData.filter((s) => s.position === id);

    const nameMap = positionStorms.reduce<Record<string, Storm[]>>((acc, s) => {
      if (!acc[s.name]) acc[s.name] = [];
      acc[s.name].push(s);
      return acc;
    }, {});

    const names = sortNamesByFirstYear(Object.entries(nameMap)).map(([name, nameStorms]) => ({
      name,
      color: nameColors?.[name] ?? "#374151",
      storms: nameStorms,
    }));

    return { id, label, names };
  });

  if (stormsByPosition.every((p) => p.names.length === 0)) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4">
      <div className="mr-2 self-start pt-2 text-sm font-semibold text-foreground">
        Other Regions:
      </div>
      {stormsByPosition.map(({ id, label, names }) => (
        <div key={id} className="flex flex-col items-center gap-1">
          <span className="mb-1 text-xs font-semibold tracking-wide text-foreground uppercase">
            {label}
          </span>
          <div className="flex min-w-16 flex-col items-center gap-1 rounded border border-stone-300 px-2 py-2 md:gap-0.5">
            {names.length === 0 ? (
              <span className="text-xs text-foreground">—</span>
            ) : (
              names.map(({ name, color, storms }) => (
                <Button
                  key={name}
                  type="text"
                  block
                  onClick={() => onNameClick(name, storms)}
                  className="h-auto! min-h-11! px-2! py-1.5! text-xs! leading-tight! font-semibold! hover:bg-transparent! hover:underline! md:min-h-0! md:py-1!"
                  style={{ color }}
                >
                  <span className="flex flex-col items-center">
                    <span>{name}</span>
                    {nameSubtitles?.[name] !== undefined && (
                      <span className="text-[10px] font-normal text-gray-500 tabular-nums">
                        {nameSubtitles[name]}
                      </span>
                    )}
                  </span>
                </Button>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpecialNamesListDiv;
