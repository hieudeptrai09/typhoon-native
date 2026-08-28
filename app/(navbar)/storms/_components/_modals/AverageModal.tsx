import ComparisonBarList, { type ComparisonBarRow } from "@/lib/components/ComparisonBarList";
import DefModal from "@/lib/components/DefModal";
import { INTENSITY_LABEL, INTENSITY_RANK, SORTING_RANK } from "@/lib/constants";
import type { BaseModalProps, IntensityType, Storm } from "@/lib/types";
import { BACKGROUND_BADGE, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import { getGroupedStorms, getIntensityFromNumber } from "@/lib/utils/storms";
import { Popover } from "antd";
import { Info } from "lucide-react";

export type AverageModalCriteria = "position" | "country" | "year" | "month" | "name";

interface AverageModalProps extends BaseModalProps {
  title: string;
  average: number;
  storms: Storm[];
  criteria: AverageModalCriteria;
}

interface IntensityGroupData {
  intensity: IntensityType;
  count: number;
  storms: Storm[];
}

const POSITION_AGENCIES = new Set(["CPHC", "NHC", "IMD"]);

const CRITERIA_TEXT: Record<
  AverageModalCriteria,
  { heading: (title: string) => string; empty: (title: string) => string }
> = {
  position: {
    heading: (title) =>
      POSITION_AGENCIES.has(title)
        ? `Storms which are named by ${title}, by intensity:`
        : `Storms in position ${title} by intensity:`,
    empty: (title) =>
      POSITION_AGENCIES.has(title)
        ? `No storms named by ${title}.`
        : `No storms in position ${title}.`,
  },
  country: {
    heading: (title) => `Storms whose names were contributed by ${title}, by intensity:`,
    empty: (title) => `No storms whose names were contributed by ${title}.`,
  },
  year: {
    heading: (title) => `Storms in ${title} by intensity:`,
    empty: (title) => `No storms in ${title}.`,
  },
  month: {
    heading: (title) => `Storms in ${title} by intensity:`,
    empty: (title) => `No storms in ${title}.`,
  },
  name: {
    heading: (title) => `Storms named ${title} by intensity:`,
    empty: (title) => `No storms named ${title}.`,
  },
};

// Negative ranks need the parentheses to stay readable next to the × sign.
const formatRank = (rank: number) => (rank < 0 ? `(−${Math.abs(rank)})` : String(rank));

// (2×5 + 1×2 + 3×0) ÷ 6 = 12 ÷ 6 = 2.00 — one term per intensity row above.
const AverageFormula = ({
  average,
  intensityData,
  total,
}: {
  average: number;
  intensityData: IntensityGroupData[];
  total: number;
}) => {
  const rankSum = intensityData.reduce(
    (sum, data) => sum + data.count * INTENSITY_RANK[data.intensity],
    0,
  );

  return (
    <div className="max-w-[288px] text-sm tabular-nums text-foreground">
      <span>
        <span>(</span>
        {intensityData.map((data, idx) => (
          <span key={data.intensity}>
            {idx > 0 && " + "}
            {data.count}×{formatRank(INTENSITY_RANK[data.intensity])}
          </span>
        ))}
        <span>
          ) ÷ {total} = {formatRank(rankSum)} ÷ {total} ={" "}
          <span className="font-bold">{average.toFixed(2)}</span>
        </span>
      </span>
    </div>
  );
};

// The position part is used to a part of modal @modal/(.)positions/[position], but the owner forced to divorce and go back to here.
const AverageModal = ({ isOpen, onClose, title, average, storms, criteria }: AverageModalProps) => {
  const { heading, empty } = CRITERIA_TEXT[criteria];
  const intensityGroups = getGroupedStorms(storms, "intensity");
  const intensityData: IntensityGroupData[] = Object.entries(intensityGroups)
    .map(([intensity, groupStorms]) => ({
      intensity: intensity as IntensityType,
      count: groupStorms.length,
      storms: [...groupStorms].sort((a, b) => a.year - b.year),
    }))
    .sort((a, b) => SORTING_RANK[b.intensity] - SORTING_RANK[a.intensity]);
  const rows: ComparisonBarRow[] = intensityData.map((data) => ({
    key: data.intensity,
    label: INTENSITY_LABEL[data.intensity],
    labelColor: TEXT_COLOR_WHITE_BACKGROUND[data.intensity],
    color: BACKGROUND_BADGE[data.intensity],
    count: data.count,
    details: (
      <div className="flex flex-col gap-1.5">
        {data.storms.map((storm) => (
          <div key={`${storm.name}-${storm.year}`} className="text-sm text-foreground">
            <span
              className="font-semibold"
              style={{ color: TEXT_COLOR_WHITE_BACKGROUND[data.intensity] }}
            >
              {storm.name}
            </span>{" "}
            {storm.year}
          </div>
        ))}
      </div>
    ),
  }));

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      width={448}
      title={<span className="text-2xl font-bold text-foreground">{title}</span>}
    >
      <div className="pt-3">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span id="avg-intensity-label" className="text-foreground">
              Overall Average Intensity:
            </span>
            <span
              className="text-lg font-bold tabular-nums"
              aria-describedby="avg-intensity-label"
              style={{ color: TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(average)] }}
            >
              {average.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">on a −2 to 5 scale</span>
            {storms.length > 0 && (
              <Popover
                styles={{ container: { backgroundColor: "#f3f4f6" } }}
                content={
                  <AverageFormula
                    average={average}
                    intensityData={intensityData}
                    total={storms.length}
                  />
                }
                trigger={["hover", "click"]}
                placement="bottom"
              >
                <button
                  type="button"
                  className="flex cursor-pointer items-center text-gray-500 transition-colors hover:text-sky-700"
                  aria-label="How the average intensity is calculated"
                >
                  <Info className="h-4 w-4" aria-hidden="true" />
                </button>
              </Popover>
            )}
          </div>
          <ComparisonBarList heading={heading(title)} emptyText={empty(title)} rows={rows} />
        </div>
      </div>
    </DefModal>
  );
};

export default AverageModal;
