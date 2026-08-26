import DataList, { DataCard } from "@/lib/components/common/DataList";
import EmptyResults from "@/lib/components/common/EmptyResults";
import { SORTING_RANK, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import type { SeasonGroup } from "@/lib/utils/storm/calendar";
import type { SortField } from "@/lib/utils/table";
import { StyleSheet, Text } from "react-native";

interface CalendarSeasonListProps {
  seasons: SeasonGroup[];
  /** Distinguishes the three season lists so a sort on one does not carry into the next. */
  filter: string;
  emptyDescription: string;
  onSeasonPress: (season: SeasonGroup) => void;
}

const peakOf = (storms: Storm[]): Storm =>
  storms.reduce((peak, storm) =>
    SORTING_RANK[storm.intensity] > SORTING_RANK[peak.intensity] ? storm : peak,
  );

const NamesCell = ({ storms }: { storms: Storm[] }) => (
  <Text style={styles.names}>
    {storms.map((storm, index) => (
      <Text key={`${storm.name}-${index}`}>
        <Text style={[styles.name, { color: TEXT_COLOR_WHITE_BACKGROUND[storm.intensity] }]}>
          {storm.name}
        </Text>
        {index < storms.length - 1 && <Text style={styles.separator}>, </Text>}
      </Text>
    ))}
  </Text>
);

const sortFields: SortField<SeasonGroup>[] = [
  { key: "year", label: "Season", compare: (a, b) => a.year - b.year },
  { key: "count", label: "Storm count", compare: (a, b) => a.storms.length - b.storms.length },
];

const CalendarSeasonList = ({
  seasons,
  filter,
  emptyDescription,
  onSeasonPress,
}: CalendarSeasonListProps) => (
  <DataList<SeasonGroup>
    data={seasons}
    keyExtractor={(season) => String(season.year)}
    sortFields={sortFields}
    sortKey={`calendar/${filter}`}
    countLabel={(count) => `${count} season${count === 1 ? "" : "s"}`}
    empty={<EmptyResults icon="calendar-outline" description={emptyDescription} />}
    onRowPress={onSeasonPress}
    renderCard={(season, index) => (
      <DataCard
        ordinal={index + 1}
        title={String(season.year)}
        accentColor={TEXT_COLOR_WHITE_BACKGROUND[peakOf(season.storms).intensity]}
        fields={[
          { label: "Storm count", value: String(season.storms.length) },
          { label: "Names", value: <NamesCell storms={season.storms} /> },
        ]}
        pressable
      />
    )}
  />
);

const styles = StyleSheet.create({
  names: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    lineHeight: 19,
  },
  name: {
    fontFamily: "OpenSans_600SemiBold",
  },
  separator: {
    color: COLOR.textFaint,
  },
});

export default CalendarSeasonList;
