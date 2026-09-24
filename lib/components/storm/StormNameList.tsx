import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard, type DataField } from "@/lib/components/common/DataList";
import ZoomEarthLink from "@/lib/components/common/ZoomEarthLink";
import IntensityCell from "@/lib/components/storm/IntensityCell";
import { BACKGROUND_BADGE, SORTING_RANK } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { IntensityType, RetiredName, Storm } from "@/lib/types";
import { formatStormDateRange } from "@/lib/utils/date";
import { getPositionSlug, getPositionTitle } from "@/lib/utils/position";
import type { SortField } from "@/lib/utils/table";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface StormNameRow {
  key: string;
  name: string;
  meaning: string;
  intensity: IntensityType;
  country: string;
  position: number;
  year: number;
  // "YYYY-MM-DD", so a plain string compare sorts it chronologically.
  dateStart: string;
  dateRange: string;
  storm: Storm;
}

interface StormNameListProps {
  storms: Storm[];
  names: RetiredName[];
  header: ReactNode;
  empty?: ReactNode;
  // Off where every row would repeat what the screen title already states.
  showCountry?: boolean;
  showYear?: boolean;
}

const NAME_FIELD: SortField<StormNameRow> = {
  key: "name",
  label: "Name",
  compare: (a, b) => a.name.localeCompare(b.name),
};

const CATEGORY_FIELD: SortField<StormNameRow> = {
  key: "intensity",
  label: "Category",
  compare: (a, b) => SORTING_RANK[a.intensity] - SORTING_RANK[b.intensity],
};

const MEANING_FIELD: SortField<StormNameRow> = {
  key: "meaning",
  label: "Meaning",
  compare: (a, b) => a.meaning.localeCompare(b.meaning),
};

const COUNTRY_FIELD: SortField<StormNameRow> = {
  key: "country",
  label: "Contributed by",
  compare: (a, b) => a.country.localeCompare(b.country),
};

const YEAR_FIELD: SortField<StormNameRow> = {
  key: "year",
  label: "Year",
  compare: (a, b) => a.year - b.year,
};

const POSITION_FIELD: SortField<StormNameRow> = {
  key: "position",
  label: "Position",
  compare: (a, b) => a.position - b.position,
};

const DATES_FIELD: SortField<StormNameRow> = {
  key: "dates",
  label: "Dates",
  compare: (a, b) => a.dateStart.localeCompare(b.dateStart),
};

// The position sits inside a row that already opens the name, so it gets its own hit slop to stay
// tappable apart from the card around it.
const PositionLink = ({ position }: { position: number }) => (
  <Pressable
    onPress={() => router.push(`/positions/${getPositionSlug(position)}`)}
    hitSlop={10}
    style={({ pressed }) => [styles.positionLink, pressed && styles.pressed]}
    accessibilityRole="link"
    accessibilityLabel={`Open position ${getPositionTitle(position)}`}
  >
    <Text style={styles.positionLabel}>{getPositionTitle(position)}</Text>
    <Ionicons name="chevron-forward" size={12} color={COLOR.accent} />
  </Pressable>
);

const StormNameList = ({
  storms,
  names,
  header,
  empty,
  showCountry = true,
  showYear = true,
}: StormNameListProps) => {
  const rows = useMemo<StormNameRow[]>(() => {
    const byName = new Map(names.map((name) => [name.name.toLowerCase(), name]));

    return storms.map((storm, index) => ({
      key: `${storm.year}-${storm.position}-${storm.name}-${index}`,
      name: storm.name,
      // A storm issued under a misspelled name still reaches its list entry through correctSpelling.
      meaning: byName.get((storm.correctSpelling ?? storm.name).toLowerCase())?.meaning ?? "",
      intensity: storm.intensity,
      country: storm.country,
      position: storm.position,
      year: storm.year,
      dateStart: storm.dateStart,
      dateRange: formatStormDateRange(storm.dateStart, storm.dateEnd),
      storm,
    }));
  }, [storms, names]);

  const sortFields = useMemo(
    () => [
      NAME_FIELD,
      CATEGORY_FIELD,
      MEANING_FIELD,
      ...(showCountry ? [COUNTRY_FIELD] : []),
      ...(showYear ? [YEAR_FIELD] : []),
      POSITION_FIELD,
      DATES_FIELD,
    ],
    [showCountry, showYear],
  );

  const renderCard = (row: StormNameRow) => {
    const fields: DataField[] = [
      { label: "Category", value: <IntensityCell intensity={row.intensity} /> },
      ...(showYear ? [{ label: "Year", value: String(row.year) }] : []),
      { label: "Dates", value: row.dateRange },
      { label: "Position", value: <PositionLink position={row.position} /> },
      ...(showCountry
        ? [
            {
              label: "Contributed by",
              value: <CountryFlag country={row.country} size={16} showName />,
            },
          ]
        : []),
      { label: "Track", value: <ZoomEarthLink storm={row.storm} /> },
    ];

    return (
      <DataCard
        accentColor={BACKGROUND_BADGE[row.intensity]}
        title={
          <View style={styles.title}>
            <Text style={styles.name}>{row.name}</Text>
            {row.meaning !== "" && <Text style={styles.meaning}>{row.meaning}</Text>}
          </View>
        }
        fields={fields}
        pressable
      />
    );
  };

  return (
    <DataList<StormNameRow>
      data={rows}
      keyExtractor={(row) => row.key}
      renderCard={renderCard}
      sortFields={sortFields}
      countLabel={(count) => `${count} storm${count === 1 ? "" : "s"}`}
      onRowPress={(row) => router.push(`/info/${encodeURIComponent(row.name.toLowerCase())}`)}
      header={header}
      empty={empty}
      stickyToolbar
    />
  );
};

const styles = StyleSheet.create({
  title: {
    gap: 2,
  },
  name: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 16,
    color: COLOR.text,
  },
  meaning: {
    fontFamily: "OpenSans_400Regular_Italic",
    fontSize: 13,
    lineHeight: 18,
    color: COLOR.textBody,
  },
  positionLink: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 2,
  },
  positionLabel: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    lineHeight: 19,
    color: COLOR.accent,
  },
  pressed: {
    opacity: 0.6,
  },
});

export default StormNameList;
