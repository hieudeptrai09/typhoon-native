import DataList from "@/lib/components/common/DataList";
import EmptyResults from "@/lib/components/common/EmptyResults";
import StatTile from "@/lib/components/common/StatTile";
import SeasonMonthsModal from "@/lib/components/season/SeasonMonthsModal";
import SeasonPaceRow, { type PaceRow } from "@/lib/components/season/SeasonPaceRow";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import {
  averageToDate,
  averageTotal,
  getSeasonToDate,
  isSeasonOngoing,
  NAMING_LIST_FIRST_YEAR,
} from "@/lib/utils/storm/calendar";
import type { SortField } from "@/lib/utils/table";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const sortFields: SortField<PaceRow>[] = [
  { key: "year", label: "Season", compare: (a, b) => a.year - b.year },
  { key: "toDate", label: "By this date", compare: (a, b) => a.toDate - b.toDate },
  { key: "delta", label: "vs. Average", compare: (a, b) => a.delta - b.delta },
  { key: "total", label: "Season total", compare: (a, b) => a.total - b.total },
  { key: "share", label: "Season done", compare: (a, b) => (a.share ?? -1) - (b.share ?? -1) },
];

const DEFAULT_SORT = [{ key: "year", order: "descend" as const }];

interface SeasonPacePaneProps {
  stormsData: Storm[];
  monthDay: string;
}

const SeasonPacePane = ({ stormsData, monthDay }: SeasonPacePaneProps) => {
  const [openRow, setOpenRow] = useState<PaceRow | null>(null);

  const seasons = useMemo(() => getSeasonToDate(stormsData, monthDay), [stormsData, monthDay]);

  const { rows, average, fullSeason } = useMemo(() => {
    const mean = averageToDate(seasons);

    return {
      average: mean,
      fullSeason: averageTotal(seasons),
      rows: seasons.map<PaceRow>((season) => ({
        ...season,
        delta: season.toDate - mean,
        share:
          isSeasonOngoing(season.year) || season.total === 0 ? null : season.toDate / season.total,
      })),
    };
  }, [seasons]);

  if (rows.length === 0) {
    return <EmptyResults icon="stats-chart-outline" description="No seasons to compare yet." />;
  }

  // Ties go to the earlier season, which is the order the rows already arrive in.
  const busiest = rows.reduce((best, row) => (row.toDate > best.toDate ? row : best));
  const quietest = rows.reduce((worst, row) => (row.toDate < worst.toDate ? row : worst));
  const scaleMax = rows.reduce((max, row) => Math.max(max, row.total, row.toDate), 1);

  const header = (
    <View style={styles.tiles}>
      <View style={styles.tile}>
        <StatTile
          label="Avg. by this day"
          hint={`Storms a season had produced by this day, averaged across the ${rows.length} seasons since ${NAMING_LIST_FIRST_YEAR}`}
        >
          {average.toFixed(1)}
        </StatTile>
      </View>
      <View style={styles.tile}>
        <StatTile
          label="Avg. full season"
          hint={`Storms a whole season produces, averaged across the finished seasons since ${NAMING_LIST_FIRST_YEAR}`}
        >
          {fullSeason.toFixed(1)}
        </StatTile>
      </View>
      <View style={styles.tile}>
        <StatTile
          label="Most by this day"
          hint={`No season had produced more by this day than ${busiest.year}`}
        >
          {busiest.toDate}
          <Text style={styles.unit}> in {busiest.year}</Text>
        </StatTile>
      </View>
      <View style={styles.tile}>
        <StatTile
          label="Fewest by this day"
          hint={`No season had produced fewer by this day than ${quietest.year}`}
        >
          {quietest.toDate}
          <Text style={styles.unit}> in {quietest.year}</Text>
        </StatTile>
      </View>
    </View>
  );

  const onRowPress = (row: PaceRow) => {
    Haptics.selectionAsync();
    setOpenRow(row);
  };

  return (
    <>
      <DataList<PaceRow>
        data={rows}
        keyExtractor={(row) => String(row.year)}
        sortFields={sortFields}
        sortKey="season/pace"
        defaultSort={DEFAULT_SORT}
        countLabel={(count) => `${count} season${count === 1 ? "" : "s"}`}
        header={header}
        onRowPress={onRowPress}
        renderCard={(row) => <SeasonPaceRow row={row} average={average} scaleMax={scaleMax} />}
      />

      <SeasonMonthsModal
        isOpen={openRow !== null}
        onClose={() => setOpenRow(null)}
        row={openRow}
        monthDay={monthDay}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tiles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACE.sm,
    marginBottom: SPACE.xs,
  },
  // Two per row on a phone; the tile itself has no width of its own.
  tile: {
    flexGrow: 1,
    flexBasis: "45%",
  },
  unit: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textMuted,
  },
});

export default SeasonPacePane;
