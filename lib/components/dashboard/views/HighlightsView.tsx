import ScreenScroll from "@/lib/components/common/ScreenScroll";
import HighlightsGrid from "@/lib/components/dashboard/grids/HighlightsGrid";
import StormRowsList from "@/lib/components/dashboard/views/StormRowsList";
import type { DashboardParams, Storm } from "@/lib/types";
import { getHighlights } from "@/lib/utils/storm/highlights";

interface HighlightsViewProps {
  params: DashboardParams;
  stormsData: Storm[];
}

const HighlightsView = ({ params, stormsData }: HighlightsViewProps) => {
  const highlights = getHighlights(stormsData, params.filter);

  if (params.mode === "table") {
    return (
      <ScreenScroll>
        <HighlightsGrid
          stormsData={stormsData}
          highlightedStorms={highlights}
          highlightType={params.filter}
        />
      </ScreenScroll>
    );
  }

  return <StormRowsList storms={highlights} sortKey={`highlights/${params.filter}`} />;
};

export default HighlightsView;
