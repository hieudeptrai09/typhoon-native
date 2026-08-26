import DataList, { DataCard } from "@/lib/components/common/DataList";
import EmptyResults from "@/lib/components/common/EmptyResults";
import StatTile from "@/lib/components/common/StatTile";
import { COLOR, SPACE } from "@/lib/constants/theme";
import { getSeasonPaceColor } from "@/lib/utils/colors";
import {
  averageToDate,
  averageTotal,
  isSeasonOngoing,
  NAMING_LIST_FIRST_YEAR,
  type SeasonToDateRow,
} from "@/lib/utils/storm/calendar";
import type { SortField } from "@/lib/utils/table";
import { StyleSheet, Text, View } from "react-native";

interface PaceRow extends SeasonToDateRow {
  delta: number; // storms ahead of (or behind) the average season by this date
  share: number | null; // null while the season is still running, with no final total to divide by
}

const sortFields: SortField<PaceRow>[] = [
  { key: "year", label: "Season", compare: (a, b) => a.year - b.year },
  { key: "toDate", label: "By this date", compare: (a, b) => a.toDate - b.toDate },
  { key: "delta", label: "vs. Average", compare: (a, b) => a.delta - b.delta },
  { key: "total", label: "Season total", compare: (a, b) => a.total - b.total },
  { key: "share", label: "Season done", compare: (a, b) => (a.share ?? -1) - (b.share ?? -1) },
];

const formatDelta = (delta: number) => `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`;

interface SeasonToDateListProps {
  rows: SeasonToDateRow[];
  onSeasonPress: (row: SeasonToDateRow) => void;
}

const SeasonToDateList = ({ rows, onSeasonPress }: SeasonToDateListProps) => {
  if (rows.length === 0) {
    return <EmptyResults icon="stats-chart-outline" description="No seasons to compare yet." />;
  }

  const average = averageToDate(rows);
  const fullSeason = averageTotal(rows);
  const paceRows: PaceRow[] = rows.map((row) => ({
    ...row,
    delta: row.toDate - average,
    share: isSeasonOngoing(row.year) || row.total === 0 ? null : row.toDate / row.total,
  }));

  // Ties go to the earlier season, which is the order the rows already arrive in.
  const busiest = paceRows.reduce((best, row) => (row.toDate > best.toDate ? row : best));
  const quietest = paceRows.reduce((worst, row) => (row.toDate < worst.toDate ? row : worst));

  const header = (
    <View style={styles.tiles}>
      <View style={styles.tile}>
        <StatTile
          label="Avg. by this day"
          hint={`Storms a season had produced by this day, averaged across the ${paceRows.length} seasons since ${NAMING_LIST_FIRST_YEAR}`}
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

  return (
    <DataList<PaceRow>
      data={paceRows}
      keyExtractor={(row) => String(row.year)}
      sortFields={sortFields}
      sortKey="calendar/todate"
      countLabel={(count) => `${count} season${count === 1 ? "" : "s"}`}
      header={header}
      onRowPress={onSeasonPress}
      renderCard={(row, index) => (
        <DataCard
          ordinal={index + 1}
          title={String(row.year)}
          accentColor={getSeasonPaceColor(row.delta)}
          fields={[
            { label: "By this date", value: String(row.toDate) },
            {
              label: "vs. Average",
              value: (
                <Text style={[styles.delta, { color: getSeasonPaceColor(row.delta) }]}>
                  {formatDelta(row.delta)}
                </Text>
              ),
            },
            { label: "Season total", value: String(row.total) },
            {
              label: "Season done",
              value:
                row.share === null ? (
                  <Text style={styles.ongoing}>Still running</Text>
                ) : (
                  `${Math.round(row.share * 100)}%`
                ),
            },
          ]}
          pressable
        />
      )}
    />
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
  delta: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    lineHeight: 19,
    fontVariant: ["tabular-nums"],
  },
  ongoing: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    lineHeight: 19,
    color: COLOR.textMuted,
  },
});

export default SeasonToDateList;
