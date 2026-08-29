import CalendarDateBar from "@/lib/components/calendar/CalendarDateBar";
import CalendarScopeTabs, { type CalendarScope } from "@/lib/components/calendar/CalendarScopeTabs";
import CalendarSeasonList from "@/lib/components/calendar/CalendarSeasonList";
import CalendarSeasonModal, {
  type CalendarSeasonKind,
} from "@/lib/components/calendar/CalendarSeasonModal";
import StaleBanner from "@/lib/components/common/StaleBanner";
import SwipePager from "@/lib/components/common/SwipePager";
import SeasonPacePane from "@/lib/components/season/SeasonPacePane";
import type { Storm } from "@/lib/types";
import { formatMonthDay } from "@/lib/utils/date";
import {
  getActiveStorms,
  getStormEnds,
  getStormStarts,
  groupBySeason,
  NAMING_LIST_FIRST_YEAR,
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

const SCOPE_ORDER: CalendarScope[] = ["started", "ended", "active", "todate"];

const PICK = {
  started: getStormStarts,
  ended: getStormEnds,
  active: getActiveStorms,
};

const isSeasonKind = (scope: CalendarScope): scope is CalendarSeasonKind => scope !== "todate";

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

const summaryFor = (scope: CalendarScope, storms: number, seasons: number, date: string) => {
  const across = `across ${plural(seasons, "season")}.`;
  switch (scope) {
    case "ended":
      return `${plural(storms, "storm")} dissipated on ${date}, ${across}`;
    case "active":
      return `${plural(storms, "storm")} were out over the basin on ${date}, ${across}`;
    case "todate":
      return `Storms JMA numbered, by season since ${NAMING_LIST_FIRST_YEAR}, counted up to ${date}. Open a season for its months.`;
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
    () => (isSeasonKind(scope) ? groupBySeason(PICK[scope](stormsData, monthDay)) : []),
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
        {scope === "todate" ? (
          <SeasonPacePane stormsData={stormsData} monthDay={monthDay} />
        ) : (
          <CalendarSeasonList
            seasons={seasons}
            filter={scope}
            emptyDescription={emptyFor(scope, dateLabel)}
            onSeasonPress={setOpenSeason}
          />
        )}
      </SwipePager>

      <CalendarSeasonModal
        isOpen={openSeason !== null}
        onClose={() => setOpenSeason(null)}
        season={openSeason}
        kind={isSeasonKind(scope) ? scope : "started"}
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
