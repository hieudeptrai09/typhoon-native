import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard } from "@/lib/components/common/DataList";
import IntensityBadge from "@/lib/components/storm/IntensityBadge";
import { INTENSITY_LABEL, SORTING_RANK } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { IntensityType, Storm } from "@/lib/types";
import { parseStormDate } from "@/lib/utils/date";
import { getPositionTitle } from "@/lib/utils/position";
import type { SortCriterion, SortField } from "@/lib/utils/table";
import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface StormRow {
  name: string;
  year: number;
  intensity: IntensityType;
  position: number;
  country: string;
  startMonth: number;
  startYear: number;
}

// A storm carried over from the previous season sorts before every January storm.
const monthSortKey = (row: StormRow): number => (row.startYear < row.year ? 0 : row.startMonth);

const BASE_SORT_FIELDS: SortField<StormRow>[] = [
  { key: "name", label: "Name", compare: (a, b) => a.name.localeCompare(b.name) },
  { key: "year", label: "Year", compare: (a, b) => a.year - b.year },
  { key: "month", label: "Month", compare: (a, b) => monthSortKey(a) - monthSortKey(b) },
];

const INTENSITY_SORT_FIELD: SortField<StormRow> = {
  key: "intensity",
  label: "Intensity",
  compare: (a, b) => SORTING_RANK[a.intensity] - SORTING_RANK[b.intensity],
};

const TAIL_SORT_FIELDS: SortField<StormRow>[] = [
  {
    key: "country",
    label: "Contributed by",
    compare: (a, b) => a.country.localeCompare(b.country),
  },
  { key: "position", label: "Position", compare: (a, b) => a.position - b.position },
];

const toRow = (storm: Storm): StormRow => {
  const start = parseStormDate(storm.dateStart);
  return {
    name: storm.name,
    year: storm.year,
    intensity: storm.intensity,
    position: storm.position,
    country: storm.country,
    startMonth: start.month,
    startYear: start.year,
  };
};

// The badge alone is a code. Spelling the scale out here is what lets the screen carry no legend.
const IntensityCell = ({ intensity }: { intensity: IntensityType }) => (
  <View style={styles.intensity}>
    <IntensityBadge intensity={intensity} size={26} />
    <Text style={styles.intensityLabel}>{INTENSITY_LABEL[intensity]}</Text>
  </View>
);

const NAME_INDEX = { key: "name", letterOf: (row: StormRow) => row.name[0]?.toUpperCase() ?? "#" };

interface StormRowsListProps {
  storms: Storm[];
  sortKey: string;
  /** Off where every row shares one intensity — the badge would repeat what the view already states. */
  showIntensity?: boolean;
  defaultSort?: SortCriterion[];
}

const StormRowsList = ({
  storms,
  sortKey,
  showIntensity = true,
  defaultSort,
}: StormRowsListProps) => {
  const data = useMemo(() => storms.map(toRow), [storms]);
  const sortFields = useMemo(
    () =>
      showIntensity
        ? [...BASE_SORT_FIELDS, INTENSITY_SORT_FIELD, ...TAIL_SORT_FIELDS]
        : [...BASE_SORT_FIELDS, ...TAIL_SORT_FIELDS],
    [showIntensity],
  );

  return (
    <DataList<StormRow>
      data={data}
      keyExtractor={(row) => `${row.name}-${row.year}`}
      sortFields={sortFields}
      sortKey={sortKey}
      defaultSort={defaultSort}
      indexField={NAME_INDEX}
      countLabel={(count) => `${count} storm${count === 1 ? "" : "s"}`}
      onRowPress={(row) => router.push(`/info/${encodeURIComponent(row.name)}`)}
      renderCard={(row, index) => (
        <DataCard
          ordinal={index + 1}
          title={row.name}
          subtitle={`${row.startMonth}/${row.startYear}`}
          fields={[
            ...(showIntensity
              ? [{ label: "Intensity", value: <IntensityCell intensity={row.intensity} /> }]
              : []),
            { label: "Year", value: String(row.year) },
            { label: "Position", value: getPositionTitle(row.position) },
            {
              label: "Contributed by",
              value: <CountryFlag country={row.country} size={16} showName />,
            },
          ]}
          pressable
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  intensity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  intensityLabel: {
    flexShrink: 1,
    fontFamily: "OpenSans_500Medium",
    fontSize: 12,
    lineHeight: 16,
    color: COLOR.textBody,
  },
});

export default StormRowsList;
