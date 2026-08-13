import AvgDateLegend from "@/lib/components/dashboard/legends/AvgDateLegend";
import HighlightsLegend from "@/lib/components/dashboard/legends/HighlightsLegend";
import IntensityLegend from "@/lib/components/dashboard/legends/IntensityLegend";
import RecurrenceLegend from "@/lib/components/dashboard/legends/RecurrenceLegend";
import type { DashboardParams } from "@/lib/types";
import { getLegendKind } from "@/lib/utils/storm/routing";

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
