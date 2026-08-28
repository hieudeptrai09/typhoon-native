import type { DashboardParams, Storm } from "@/lib/types";
import HighlightsGrid from "../_grids/HighlightsGrid";
import { getHighlights } from "../../_utils/stats";
import StormRowsTable from "./StormRowsTable";

interface HighlightsViewProps {
  params: DashboardParams;
  stormsData: Storm[];
}

const HighlightsView = ({ params, stormsData }: HighlightsViewProps) => {
  const highlights = getHighlights(stormsData, params.filter);

  if (params.mode === "table") {
    return (
      <HighlightsGrid
        stormsData={stormsData}
        highlightedStorms={highlights}
        highlightType={params.filter}
      />
    );
  }

  return <StormRowsTable storms={highlights} tableKey={params.filter} />;
};

export default HighlightsView;
