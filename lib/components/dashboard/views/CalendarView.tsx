import CalendarSeasonModal, {
  type CalendarSeasonKind,
} from "@/lib/components/dashboard/modals/CalendarSeasonModal";
import SeasonMonthsModal from "@/lib/components/dashboard/modals/SeasonMonthsModal";
import CalendarSeasonList from "@/lib/components/dashboard/views/CalendarSeasonList";
import SeasonToDateList from "@/lib/components/dashboard/views/SeasonToDateList";
import CalendarDateBar from "@/lib/components/dashboard/widgets/CalendarDateBar";
import type { DashboardParams, Storm } from "@/lib/types";
import { formatMonthDay } from "@/lib/utils/date";
import {
  getActiveStorms,
  getSeasonToDate,
  getStormEnds,
  getStormStarts,
  groupBySeason,
  NAMING_LIST_FIRST_YEAR,
  type SeasonGroup,
  type SeasonToDateRow,
} from "@/lib/utils/storm/calendar";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

interface CalendarViewProps {
  params: DashboardParams;
  stormsData: Storm[];
  monthDay: string;
  today: string;
  onMonthDayChange: (monthDay: string) => void;
}

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

const isSeasonKind = (filter: string): filter is CalendarSeasonKind =>
  filter === "started" || filter === "ended" || filter === "active";

const CalendarView = ({
  params,
  stormsData,
  monthDay,
  today,
  onMonthDayChange,
}: CalendarViewProps) => {
  const [openSeason, setOpenSeason] = useState<SeasonGroup | null>(null);
  const [openPace, setOpenPace] = useState<SeasonToDateRow | null>(null);

  const seasons = useMemo(() => {
    if (!isSeasonKind(params.filter)) return [];
    const pick = { started: getStormStarts, ended: getStormEnds, active: getActiveStorms }[
      params.filter
    ];
    return groupBySeason(pick(stormsData, monthDay));
  }, [stormsData, monthDay, params.filter]);

  const paceRows = useMemo(
    () => (params.filter === "todate" ? getSeasonToDate(stormsData, monthDay) : []),
    [stormsData, monthDay, params.filter],
  );

  const dateLabel = formatMonthDay(monthDay);
  const stormCount = seasons.reduce((sum, season) => sum + season.storms.length, 0);

  const summaries: Record<string, string> = {
    started: `${plural(stormCount, "storm")} formed on ${dateLabel}, across ${plural(seasons.length, "season")}.`,
    ended: `${plural(stormCount, "storm")} dissipated on ${dateLabel}, across ${plural(seasons.length, "season")}.`,
    active: `${plural(stormCount, "storm")} were out over the basin on ${dateLabel}, across ${plural(seasons.length, "season")}.`,
    todate: `Storms JMA numbered, by season since ${NAMING_LIST_FIRST_YEAR}, counted up to ${dateLabel}. Open a season for its months.`,
  };

  const emptyDescriptions: Record<string, string> = {
    started: `No storm has ever formed on ${dateLabel}.`,
    ended: `No storm has ever dissipated on ${dateLabel}.`,
    active: `No storm has ever been out over the basin on ${dateLabel}.`,
  };

  return (
    <View style={styles.root}>
      <CalendarDateBar
        monthDay={monthDay}
        today={today}
        onChange={onMonthDayChange}
        summary={summaries[params.filter] ?? ""}
      />

      {params.filter === "todate" ? (
        <SeasonToDateList rows={paceRows} onSeasonPress={setOpenPace} />
      ) : (
        <CalendarSeasonList
          seasons={seasons}
          filter={params.filter}
          emptyDescription={emptyDescriptions[params.filter] ?? ""}
          onSeasonPress={setOpenSeason}
        />
      )}

      <CalendarSeasonModal
        isOpen={openSeason !== null}
        onClose={() => setOpenSeason(null)}
        season={openSeason}
        kind={isSeasonKind(params.filter) ? params.filter : "started"}
        monthDay={monthDay}
      />

      <SeasonMonthsModal
        isOpen={openPace !== null}
        onClose={() => setOpenPace(null)}
        row={openPace}
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

export default CalendarView;
