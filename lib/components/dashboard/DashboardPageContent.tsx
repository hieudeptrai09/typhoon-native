import FrownError from "@/lib/components/common/FrownError";
import type { DetailTarget } from "@/lib/components/common/OpenDetailButton";
import StaleBanner from "@/lib/components/common/StaleBanner";
import SwipePager from "@/lib/components/common/SwipePager";
import IntensityBreakdown from "@/lib/components/dashboard/breakdowns/IntensityBreakdown";
import RecurrenceBreakdown from "@/lib/components/dashboard/breakdowns/RecurrenceBreakdown";
import SeasonDatesBreakdown from "@/lib/components/dashboard/breakdowns/SeasonDatesBreakdown";
import StormListBreakdown from "@/lib/components/dashboard/breakdowns/StormListBreakdown";
import GroupSheet, { type GroupStat } from "@/lib/components/dashboard/modals/GroupSheet";
import RecordsView from "@/lib/components/dashboard/views/RecordsView";
import StatsView from "@/lib/components/dashboard/views/StatsView";
import StormsView from "@/lib/components/dashboard/views/StormsView";
import DashboardControlBar from "@/lib/components/dashboard/widgets/DashboardControlBar";
import type { DashboardParams, Storm } from "@/lib/types";
import { getPositionTitle } from "@/lib/utils/position";
import { formatDayOfYear, formatDuration } from "@/lib/utils/storm/dates";
import { VIEWS } from "@/lib/utils/storm/routing";
import type { StatRow } from "@/lib/utils/storm/stats";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

interface DashboardPageContentProps {
  stormsData: Storm[] | null;
  params: DashboardParams;
  onParamsChange: (params: DashboardParams) => void;
  onSelectView: (view: string) => void;
  staleError?: boolean;
}

type OpenGroup =
  | { kind: "position"; position: number; storms: Storm[] }
  | { kind: "stat"; row: StatRow; metric: string; groupBy: string };

const POSITION_AGENCIES = new Set(["CPHC", "NHC", "IMD"]);

const headingFor = (groupBy: string, title: string): string => {
  switch (groupBy) {
    case "position":
      return POSITION_AGENCIES.has(title)
        ? `Storms which are named by ${title}, by intensity:`
        : `Storms in position ${title} by intensity:`;
    case "country":
      return `Storms whose names were contributed by ${title}, by intensity:`;
    case "name":
      return `Storms named ${title} by intensity:`;
    default:
      return `Storms in ${title} by intensity:`;
  }
};

const emptyFor = (groupBy: string, title: string): string => {
  switch (groupBy) {
    case "position":
      return POSITION_AGENCIES.has(title)
        ? `No storms named by ${title}.`
        : `No storms in position ${title}.`;
    case "country":
      return `No storms whose names were contributed by ${title}.`;
    case "name":
      return `No storms named ${title}.`;
    default:
      return `No storms in ${title}.`;
  }
};

// Only these two groupings have a screen of their own; a year or a month ends at the sheet.
const targetFor = (groupBy: string, row: StatRow): DetailTarget | undefined => {
  if (groupBy === "position") return { kind: "position", position: Number(row.key) };
  if (groupBy === "name") return { kind: "name", name: row.key };
  return undefined;
};

const titleFor = (group: OpenGroup): string =>
  group.kind === "position" ? getPositionTitle(group.position) : group.row.label;

const targetOf = (group: OpenGroup): DetailTarget | undefined =>
  group.kind === "position"
    ? { kind: "position", position: group.position }
    : targetFor(group.groupBy, group.row);

const statsFor = (group: OpenGroup): GroupStat[] => {
  if (group.kind === "position") {
    const names = new Set(group.storms.map((storm) => storm.name));
    return [
      { label: "Storms", value: String(group.storms.length) },
      { label: "Names", value: String(names.size), hint: "Names this position has carried" },
    ];
  }

  const { row, metric } = group;
  const count = { label: "Storms", value: String(row.count) };

  if (metric === "recurrence") {
    return [
      {
        label: "Avg. reuse gap",
        value: row.value < 0 ? "N/A" : `${row.display} years`,
        hint: "About six years is one full turn of the 140-position list",
      },
      count,
    ];
  }

  if (metric === "dates") {
    return [
      { label: "Avg. start", value: formatDayOfYear(row.startDoy ?? -1) },
      { label: "Avg. end", value: formatDayOfYear(row.endDoy ?? -1) },
      { label: "Avg. duration", value: formatDuration(row.duration ?? -1) },
      count,
    ];
  }

  return [{ label: "Average intensity", value: row.display, hint: "On a −2 to 5 scale" }, count];
};

const Breakdown = (group: OpenGroup) => {
  if (group.kind === "position") return <StormListBreakdown storms={group.storms} />;

  const { row, metric, groupBy } = group;
  if (metric === "recurrence") return <RecurrenceBreakdown storms={row.storms} />;
  if (metric === "dates") return <SeasonDatesBreakdown storms={row.storms} />;

  return (
    <IntensityBreakdown
      storms={row.storms}
      average={row.value}
      heading={headingFor(groupBy, row.label)}
      emptyText={emptyFor(groupBy, row.label)}
    />
  );
};

export default function DashboardPageContent({
  stormsData,
  params,
  onParamsChange,
  onSelectView,
  staleError = false,
}: DashboardPageContentProps) {
  const [openGroup, setOpenGroup] = useState<OpenGroup | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { view, filter, mode } = params;

  // The names grid is itself a horizontal pager, so a sideways drag there belongs to it.
  const canSwipeViews = !(mode === "table" && filter === "name");

  const stepView = (step: 1 | -1) => {
    const index = VIEWS.indexOf(view as (typeof VIEWS)[number]);
    onSelectView(VIEWS[(index + step + VIEWS.length) % VIEWS.length]);
  };

  const open = (group: OpenGroup) => {
    setOpenGroup(group);
    setSheetOpen(true);
  };

  const selectGroup = (row: StatRow) =>
    open({ kind: "stat", row, metric: params.metric, groupBy: params.filter });

  const selectPosition = (position: number) =>
    open({
      kind: "position",
      position,
      storms: (stormsData ?? []).filter((storm) => storm.position === position),
    });

  if (!stormsData) return <FrownError />;

  return (
    <View style={styles.root}>
      <DashboardControlBar params={params} onChange={onParamsChange} onSelectView={onSelectView} />

      {staleError && <StaleBanner />}

      <SwipePager enabled={canSwipeViews} onPrev={() => stepView(-1)} onNext={() => stepView(1)}>
        {view === "records" ? (
          <RecordsView params={params} stormsData={stormsData} />
        ) : view === "stats" ? (
          <StatsView params={params} stormsData={stormsData} onSelectGroup={selectGroup} />
        ) : (
          <StormsView params={params} stormsData={stormsData} onSelectPosition={selectPosition} />
        )}
      </SwipePager>

      {/* Kept mounted through the closing animation, so the breakdown does not blank mid-slide. */}
      <GroupSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={openGroup ? titleFor(openGroup) : ""}
        accentColor={openGroup?.kind === "stat" ? openGroup.row.color : undefined}
        stats={openGroup ? statsFor(openGroup) : []}
        target={openGroup ? targetOf(openGroup) : undefined}
      >
        {openGroup && <Breakdown {...openGroup} />}
      </GroupSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
