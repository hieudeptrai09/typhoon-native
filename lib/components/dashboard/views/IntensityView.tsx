import ScreenScroll from "@/lib/components/common/ScreenScroll";
import IntensityGrid from "@/lib/components/dashboard/grids/IntensityGrid";
import StormRowsList from "@/lib/components/dashboard/views/StormRowsList";
import type { DashboardParams, Storm } from "@/lib/types";
import { getStormsByIntensity } from "@/lib/utils/storm/highlights";
import { intensityFromSlug } from "@/lib/utils/storm/intensity";

interface IntensityViewProps {
  params: DashboardParams;
  stormsData: Storm[];
}

const IntensityView = ({ params, stormsData }: IntensityViewProps) => {
  // Only reachable with a filter the routing already validated as an intensity slug.
  const intensity = intensityFromSlug(params.filter);
  if (!intensity) return null;

  const matches = getStormsByIntensity(stormsData, intensity);

  if (params.mode === "table") {
    return (
      <ScreenScroll>
        <IntensityGrid stormsData={stormsData} intensityStorms={matches} intensity={intensity} />
      </ScreenScroll>
    );
  }

  return (
    <StormRowsList storms={matches} sortKey={`intensity/${params.filter}`} showIntensity={false} />
  );
};

export default IntensityView;
