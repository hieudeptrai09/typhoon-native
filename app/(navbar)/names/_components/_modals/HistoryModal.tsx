import DefModal from "@/lib/components/DefModal";
import ImageCredit from "@/lib/components/ImageCredit";
import ImageWithLoader from "@/lib/components/ImageWithLoader";
import type { BaseModalProps, StormHistoryEntry, TyphoonName } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import { Button } from "antd";
import { useState } from "react";

// It's used to a part of modal @modal/(.)positions/[position], but the owner forced to divorce and go back to here.
interface HistoryModalProps extends BaseModalProps {
  position: number;
  positionNames: TyphoonName[];
  storms: StormHistoryEntry[];
}

const HistoryModal = ({ isOpen, onClose, position, positionNames, storms }: HistoryModalProps) => {
  const [expandedState, setExpandedState] = useState<{ position: number; nameId: number } | null>(
    null,
  );

  if (!isOpen) return null;

  const expandedNameId = expandedState?.position === position ? expandedState.nameId : null;

  const stormsByName: Record<string, StormHistoryEntry[]> = {};
  storms.forEach((storm) => {
    if (!stormsByName[storm.name]) stormsByName[storm.name] = [];
    stormsByName[storm.name].push(storm);
  });

  const positionTitle = getPositionTitle(position);

  const sortedNames = [...positionNames].sort((a, b) => {
    const aStorms = stormsByName[a.name] || [];
    const bStorms = stormsByName[b.name] || [];
    const aFirst = aStorms.length > 0 ? Math.min(...aStorms.map((s) => s.year)) : Infinity;
    const bFirst = bStorms.length > 0 ? Math.min(...bStorms.map((s) => s.year)) : Infinity;
    return aFirst - bFirst;
  });

  const handleNameClick = (nameId: number) => {
    setExpandedState((prev) =>
      prev?.position === position && prev.nameId === nameId ? null : { position, nameId },
    );
  };

  return (
    <DefModal
      open={isOpen}
      onClose={() => {
        setExpandedState(null);
        onClose();
      }}
      width={480}
      title={<span className="text-2xl font-bold text-foreground">{positionTitle}</span>}
    >
      <div className="pt-4">
        {positionNames.length === 0 ? (
          <div className="py-4 text-center text-foreground">No names at this position.</div>
        ) : (
          <div className="space-y-1">
            {sortedNames.map((name) => {
              const nameStorms = stormsByName[name.name] || [];
              const count = nameStorms.length;
              const years = nameStorms.map((s) => s.year).join(", ");
              const isExpanded = expandedNameId === name.id;
              const hasExpandable = !!name.image;

              return (
                <div key={name.id} className="overflow-hidden rounded-lg">
                  <Button
                    type="text"
                    block
                    disabled={!hasExpandable}
                    onClick={() => hasExpandable && handleNameClick(name.id)}
                    aria-describedby={name.meaning ? `history-meaning-${name.id}` : undefined}
                    aria-expanded={hasExpandable ? isExpanded : undefined}
                    className={`h-auto! rounded-lg! px-3! py-2! text-left! ${
                      isExpanded ? "rounded-b-none! bg-sky-50!" : ""
                    } ${!hasExpandable ? "cursor-default!" : ""}`}
                  >
                    <div className="flex w-full items-baseline gap-2">
                      <span className="min-w-8 shrink-0 text-sm font-bold text-foreground">
                        {count > 0 ? `x${count}` : "x0"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="whitespace-pre-line">
                          <span
                            className="font-semibold"
                            style={{ color: getNameStatusColor(name) }}
                          >
                            {name.name}
                          </span>
                          {count > 0 && (
                            <span className="ml-1 text-sm text-foreground">({years})</span>
                          )}
                          {name.language && (
                            <span className="ml-1 text-xs text-foreground">· {name.language}</span>
                          )}
                        </div>
                        {name.meaning && (
                          <p
                            id={`history-meaning-${name.id}`}
                            className="mt-0.5 text-xs leading-relaxed whitespace-pre-line text-teal-700 italic"
                          >
                            {name.meaning}
                          </p>
                        )}
                        {name.description && (
                          <p className="mt-0.5 text-xs leading-relaxed whitespace-pre-line text-foreground">
                            {name.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Button>

                  {isExpanded && name.image && (
                    <div className="rounded-b-lg border-t border-sky-100 bg-sky-50 px-4 py-3">
                      <div className="mx-auto" style={{ width: 160 }}>
                        <div
                          className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                          style={{ aspectRatio: "4/3" }}
                        >
                          <ImageWithLoader
                            src={name.image}
                            alt={name.name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                      <ImageCredit credit={name.imageCredit} align="center" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DefModal>
  );
};

export default HistoryModal;
