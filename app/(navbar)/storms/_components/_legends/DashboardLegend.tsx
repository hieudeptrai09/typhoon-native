import type { DashboardParams } from "@/lib/types";
import { getLegendKind } from "../../_utils/routing";
import AvgDateLegend from "./AvgDateLegend";
import HighlightsLegend from "./HighlightsLegend";
import IntensityLegend from "./IntensityLegend";
import RecurrenceLegend from "./RecurrenceLegend";

interface DashboardLegendProps {
  params: DashboardParams;
}

// Single place the dashboard decides which legend the current view has earned.
const DashboardLegend = ({ params }: DashboardLegendProps) => {
  switch (getLegendKind(params)) {
    case "intensity":
      return <IntensityLegend />;
    case "recurrence":
      return <RecurrenceLegend />;
    case "avgdate":
      return <AvgDateLegend />;
    case "highlight":
      return <HighlightsLegend filter={params.filter} />;
    default:
      return null;
  }
};

export default DashboardLegend;
