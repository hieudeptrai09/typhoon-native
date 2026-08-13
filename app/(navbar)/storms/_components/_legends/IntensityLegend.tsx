import { INTENSITY_LABEL, INTENSITY_RANK, SORTING_RANK } from "@/lib/constants";
import type { IntensityType } from "@/lib/types";
import { BACKGROUND_BADGE, TEXT_COLOR_BADGE } from "@/lib/utils/colors";
import LegendShell from "./LegendShell";

export default function IntensityLegend() {
  return (
    <LegendShell label="Intensity Scale:" ariaLabel="Intensity scale legend">
      {(Object.keys(INTENSITY_LABEL) as IntensityType[])
        .sort((a, b) => SORTING_RANK[a] - SORTING_RANK[b])
        .map((intensity) => (
          <span key={intensity} className="flex items-center gap-1.5">
            <span
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold"
              style={{
                backgroundColor: BACKGROUND_BADGE[intensity],
                color: TEXT_COLOR_BADGE[intensity],
              }}
            >
              {intensity}
            </span>
            <span className="text-xs text-foreground">
              {INTENSITY_LABEL[intensity]}{" "}
              <span className="text-foreground">({INTENSITY_RANK[intensity]})</span>
            </span>
          </span>
        ))}
    </LegendShell>
  );
}
