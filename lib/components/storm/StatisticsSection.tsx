import Section from "@/lib/components/common/Section";
import SegmentedTabs, { type SegmentedTab } from "@/lib/components/common/SegmentedTabs";
import IntensityBreakdown from "@/lib/components/storm/breakdowns/IntensityBreakdown";
import RecurrenceBreakdown from "@/lib/components/storm/breakdowns/RecurrenceBreakdown";
import SeasonDatesBreakdown from "@/lib/components/storm/breakdowns/SeasonDatesBreakdown";
import StormStats from "@/lib/components/storm/StormStats";
import type { Storm } from "@/lib/types";
import { useState } from "react";

type BreakdownTab = "intensity" | "dates" | "gap";

const TABS: SegmentedTab<BreakdownTab>[] = [
  { key: "intensity", label: "Intensity", icon: "pulse-outline" },
  { key: "dates", label: "Dates", icon: "calendar-number-outline" },
  { key: "gap", label: "Gap", icon: "repeat-outline" },
];

interface StatisticsSectionProps {
  storms: Storm[];
  // Gap only means something within one name or slot: a season or a country reuses no name.
  showGap?: boolean;
}

const StatisticsSection = ({ storms, showGap = true }: StatisticsSectionProps) => {
  const [tab, setTab] = useState<BreakdownTab>("intensity");

  if (storms.length === 0) return null;

  const tabs = showGap ? TABS : TABS.filter(({ key }) => key !== "gap");
  const active = tabs.some(({ key }) => key === tab) ? tab : "intensity";

  return (
    <Section title="Statistics">
      <StormStats storms={storms} showRecurrence={showGap} />
      <SegmentedTabs tabs={tabs} active={active} onChange={setTab} />
      {active === "dates" ? (
        <SeasonDatesBreakdown storms={storms} />
      ) : active === "gap" ? (
        <RecurrenceBreakdown storms={storms} />
      ) : (
        <IntensityBreakdown storms={storms} />
      )}
    </Section>
  );
};

export default StatisticsSection;
