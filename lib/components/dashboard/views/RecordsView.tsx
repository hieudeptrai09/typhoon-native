import ScreenScroll from "@/lib/components/common/ScreenScroll";
import SubsetGrid from "@/lib/components/dashboard/grids/SubsetGrid";
import StormRowsList from "@/lib/components/dashboard/views/StormRowsList";
import { BACKGROUND_BADGE } from "@/lib/constants";
import type { DashboardParams, Storm } from "@/lib/types";
import { getHighlightCellColor } from "@/lib/utils/colors";
import { getHighlights, getStormsByIntensity } from "@/lib/utils/storm/highlights";
import { intensityFromSlug } from "@/lib/utils/storm/intensity";

interface RecordsViewProps {
  params: DashboardParams;
  stormsData: Storm[];
}

const RecordsView = ({ params, stormsData }: RecordsViewProps) => {
  const intensity = intensityFromSlug(params.filter);

  const storms = intensity
    ? getStormsByIntensity(stormsData, intensity)
    : getHighlights(stormsData, params.filter);

  if (params.mode === "list") {
    return (
      <StormRowsList
        storms={storms}
        sortKey={`records/${params.filter}`}
        showIntensity={intensity === null}
      />
    );
  }

  return (
    <ScreenScroll>
      <SubsetGrid
        stormsData={stormsData}
        storms={storms}
        color={intensity ? BACKGROUND_BADGE[intensity] : getHighlightCellColor(params.filter)}
        mergeYears={intensity !== null}
      />
    </ScreenScroll>
  );
};

export default RecordsView;
