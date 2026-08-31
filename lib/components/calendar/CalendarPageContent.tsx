import CalendarDateBar from "@/lib/components/calendar/CalendarDateBar";
import CalendarScopeTabs, { type CalendarScope } from "@/lib/components/calendar/CalendarScopeTabs";
import CalendarSpine from "@/lib/components/calendar/CalendarSpine";
import StaleBanner from "@/lib/components/common/StaleBanner";
import SwipePager from "@/lib/components/common/SwipePager";
import SeasonPacePane from "@/lib/components/season/SeasonPacePane";
import type { Storm } from "@/lib/types";
import { formatMonthDay } from "@/lib/utils/date";
import {
  buildDaySpine,
  countDaySeasons,
  getDayDensity,
  NAMING_LIST_FIRST_YEAR,
  type DayEventKind,
} from "@/lib/utils/storm/calendar";
import { useMemo } from "react";
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

const DENSITY_VERB: Record<DayEventKind, string> = {
  started: "formed",
  ended: "dissipated",
  active: "out over the basin",
};

const isDayKind = (scope: CalendarScope): scope is DayEventKind => scope !== "todate";

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

const summaryFor = (
  scope: CalendarScope,
  storms: number,
  years: number,
  span: number,
  date: string,
) => {
  const inYears = `in ${years} of ${plural(span, "season")}.`;

  switch (scope) {
    case "ended":
      return `${plural(storms, "storm")} dissipated on ${date}, ${inYears}`;
    case "active":
      return `${plural(storms, "storm")} were out over the basin on ${date}, ${inYears}`;
    case "todate":
      return `Storms JMA numbered, by season since ${NAMING_LIST_FIRST_YEAR}, counted up to ${date}. Open a season for its months.`;
    default:
      return `${plural(storms, "storm")} formed on ${date}, ${inYears}`;
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
  // The pace pane counts storms as they form, so the strip under the date keeps meaning there.
  const densityKind: DayEventKind = isDayKind(scope) ? scope : "started";

  const density = useMemo(() => getDayDensity(stormsData, densityKind), [stormsData, densityKind]);

  const rows = useMemo(
    () => (isDayKind(scope) ? buildDaySpine(stormsData, monthDay, scope) : []),
    [stormsData, monthDay, scope],
  );

  const stormCount = useMemo(
    () => rows.reduce((total, row) => total + row.entries.length, 0),
    [rows],
  );
  const spanYears = useMemo(() => countDaySeasons(stormsData, monthDay), [stormsData, monthDay]);

  const dateLabel = formatMonthDay(monthDay);

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
        summary={summaryFor(scope, stormCount, rows.length, spanYears, dateLabel)}
        density={density}
        densityVerb={DENSITY_VERB[densityKind]}
      />

      {staleError && <StaleBanner />}

      <SwipePager onPrev={() => stepScope(-1)} onNext={() => stepScope(1)}>
        {isDayKind(scope) ? (
          <CalendarSpine
            // A new day is a new history: start it at the top, with nothing left expanded.
            key={`${scope}-${monthDay}`}
            rows={rows}
            kind={scope}
            monthDay={monthDay}
            emptyDescription={emptyFor(scope, dateLabel)}
          />
        ) : (
          <SeasonPacePane stormsData={stormsData} monthDay={monthDay} />
        )}
      </SwipePager>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default CalendarPageContent;
