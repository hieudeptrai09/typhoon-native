import AvgDateLegend from "@/lib/components/dashboard/legends/AvgDateLegend";
import HighlightsLegend from "@/lib/components/dashboard/legends/HighlightsLegend";
import IntensityLegend from "@/lib/components/dashboard/legends/IntensityLegend";
import RecurrenceLegend from "@/lib/components/dashboard/legends/RecurrenceLegend";
import StormCountLegend from "@/lib/components/dashboard/legends/StormCountLegend";
import type { DashboardParams } from "@/lib/types";
import { getLegendKind } from "@/lib/utils/storm/routing";

interface DashboardLegendProps {
  params: DashboardParams;
}

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
    case "count":
      return <StormCountLegend />;
    default:
      return null;
  }
};

export default DashboardLegend;
