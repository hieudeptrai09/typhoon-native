import CalendarDateBar from "@/lib/components/calendar/CalendarDateBar";
import CalendarScopeTabs, { type CalendarScope } from "@/lib/components/calendar/CalendarScopeTabs";
import CalendarSeasonList from "@/lib/components/calendar/CalendarSeasonList";
import CalendarSeasonModal from "@/lib/components/calendar/CalendarSeasonModal";
import StaleBanner from "@/lib/components/common/StaleBanner";
import SwipePager from "@/lib/components/common/SwipePager";
import type { Storm } from "@/lib/types";
import { formatMonthDay } from "@/lib/utils/date";
import {
  getActiveStorms,
  getStormEnds,
  getStormStarts,
  groupBySeason,
  type SeasonGroup,
} from "@/lib/utils/storm/calendar";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

interface CalendarPageContentProps {
  stormsData: Storm[];
  scope: CalendarScope;
  onScopeChange: (scope: CalendarScope) => void;
  monthDay: string;
  today: string;
  onMonthDayChange: (monthDay: string) => void;
  staleError?: boolean;
}

const SCOPE_ORDER: CalendarScope[] = ["started", "ended", "active"];

const PICK = {
  started: getStormStarts,
  ended: getStormEnds,
  active: getActiveStorms,
};

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

const summaryFor = (scope: CalendarScope, storms: number, seasons: number, date: string) => {
  const across = `across ${plural(seasons, "season")}.`;
  switch (scope) {
    case "ended":
      return `${plural(storms, "storm")} dissipated on ${date}, ${across}`;
    case "active":
      return `${plural(storms, "storm")} were out over the basin on ${date}, ${across}`;
    default:
      return `${plural(storms, "storm")} formed on ${date}, ${across}`;
  }
};

const emptyFor = (scope: CalendarScope, date: string) => {
  switch (scope) {
    case "ended":
      return `No storm has ever dissipated on ${date}.`;
    case "active":
      return `No storm has ever been out over the basin on ${date}.`;
    default:
      return `No storm has ever formed on ${date}.`;
  }
};

const CalendarPageContent = ({
  stormsData,
  scope,
  onScopeChange,
  monthDay,
  today,
  onMonthDayChange,
  staleError = false,
}: CalendarPageContentProps) => {
  const [openSeason, setOpenSeason] = useState<SeasonGroup | null>(null);

  const seasons = useMemo(
    () => groupBySeason(PICK[scope](stormsData, monthDay)),
    [stormsData, monthDay, scope],
  );

  const dateLabel = formatMonthDay(monthDay);
  const stormCount = seasons.reduce((sum, season) => sum + season.storms.length, 0);

  const stepScope = (step: 1 | -1) => {
    const index = SCOPE_ORDER.indexOf(scope);
    onScopeChange(SCOPE_ORDER[(index + step + SCOPE_ORDER.length) % SCOPE_ORDER.length]);
  };

  return (
    <View style={styles.root}>
      <CalendarScopeTabs scope={scope} onChange={onScopeChange} />

      <CalendarDateBar
        monthDay={monthDay}
        today={today}
        onChange={onMonthDayChange}
        summary={summaryFor(scope, stormCount, seasons.length, dateLabel)}
      />

      {staleError && <StaleBanner />}

      <SwipePager onPrev={() => stepScope(-1)} onNext={() => stepScope(1)}>
        <CalendarSeasonList
          seasons={seasons}
          filter={scope}
          emptyDescription={emptyFor(scope, dateLabel)}
          onSeasonPress={setOpenSeason}
        />
      </SwipePager>

      <CalendarSeasonModal
        isOpen={openSeason !== null}
        onClose={() => setOpenSeason(null)}
        season={openSeason}
        kind={scope}
        monthDay={monthDay}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default CalendarPageContent;
