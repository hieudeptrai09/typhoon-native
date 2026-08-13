import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard } from "@/lib/components/common/DataList";
import AvgDateGrid from "@/lib/components/dashboard/grids/AvgDateGrid";
import AvgDateNameGrid from "@/lib/components/dashboard/views/AvgDateNameGrid";
import SpecialButtons from "@/lib/components/dashboard/widgets/SpecialButtons";
import type { DashboardParams, Storm } from "@/lib/types";
import { getAvgDateColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import { getGroupedStorms } from "@/lib/utils/storm/aggregate";
import {
  calculateAvgDatesByGroup,
  calculateAvgDuration,
  formatDayOfYear,
  formatDuration,
  getDoyMonth,
  type AvgDates,
} from "@/lib/utils/storm/dates";
import type { SortField } from "@/lib/utils/table";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface AvgDateViewProps {
  params: DashboardParams;
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
}

interface AvgDateRow {
  position: number;
  name?: string;
  country: string;
  count: number;
  startDoy: number;
  endDoy: number;
  avgDuration: number;
}

const DateText = ({ doy }: { doy: number }) => (
  <Text style={[styles.date, { color: getAvgDateColor(getDoyMonth(doy)) }]}>
    {formatDayOfYear(doy)}
  </Text>
);

const positionField: SortField<AvgDateRow> = {
  key: "position",
  label: "Position",
  compare: (a, b) => a.position - b.position,
};

const countryField: SortField<AvgDateRow> = {
  key: "country",
  label: "Contributed by",
  compare: (a, b) => a.country.localeCompare(b.country),
};

const countField: SortField<AvgDateRow> = {
  key: "count",
  label: "Storm count",
  compare: (a, b) => a.count - b.count,
};

const startField: SortField<AvgDateRow> = {
  key: "start",
  label: "Avg. date start",
  compare: (a, b) => a.startDoy - b.startDoy,
};

const endField: SortField<AvgDateRow> = {
  key: "end",
  label: "Avg. date end",
  compare: (a, b) => a.endDoy - b.endDoy,
};

const durationField: SortField<AvgDateRow> = {
  key: "duration",
  label: "Avg. duration",
  compare: (a, b) => a.avgDuration - b.avgDuration,
};

const nameField: SortField<AvgDateRow> = {
  key: "name",
  label: "Name",
  compare: (a, b) => (a.name ?? "").localeCompare(b.name ?? ""),
};

const makeSortFields = (filterType: "position" | "name"): SortField<AvgDateRow>[] =>
  filterType === "name"
    ? [nameField, countryField, positionField, countField, startField, endField, durationField]
    : [positionField, countryField, countField, startField, endField, durationField];

const buildRows = (
  filterType: "position" | "name",
  avgDateMap: Record<string, AvgDates>,
  groupedStorms: Record<string, Storm[]>,
): AvgDateRow[] =>
  Object.entries(avgDateMap).map(([key, dates]) => {
    const storms = groupedStorms[key] || [];
    const base = {
      country: storms[0]?.country ?? "",
      count: storms.length,
      startDoy: dates.startDoy,
      endDoy: dates.endDoy,
      avgDuration: calculateAvgDuration(storms),
    };
    return filterType === "name"
      ? { name: key, position: storms[0]?.position ?? 0, ...base }
      : { position: parseInt(key), ...base };
  });

const AvgDateView = ({ params, stormsData, onCellClick }: AvgDateViewProps) => {
  const filterType = (params.filter || "position") as "position" | "name";

  const avgDateMap = useMemo(
    () => calculateAvgDatesByGroup(stormsData, filterType),
    [stormsData, filterType],
  );

  const groupedStorms = useMemo(
    () => getGroupedStorms(stormsData, filterType),
    [stormsData, filterType],
  );

  const avgDateValuesForGrid = useMemo<Record<number, AvgDates>>(() => {
    if (filterType !== "position") return {};
    const result: Record<number, AvgDates> = {};
    Object.entries(avgDateMap).forEach(([key, value]) => {
      result[Number(key)] = value;
    });
    return result;
  }, [avgDateMap, filterType]);

  const sortFields = useMemo(() => makeSortFields(filterType), [filterType]);

  if (params.mode === "table" && filterType === "name") {
    return <AvgDateNameGrid stormsData={stormsData} onCellClick={onCellClick} />;
  }

  if (params.mode === "table" && filterType === "position") {
    return (
      <View style={styles.stack}>
        <AvgDateGrid
          onCellClick={onCellClick}
          stormsData={stormsData}
          avgDateValues={avgDateValuesForGrid}
          isClickable
        />
        <SpecialButtons onCellClick={onCellClick} avgDateValues={avgDateValuesForGrid} />
      </View>
    );
  }

  const data = buildRows(filterType, avgDateMap, groupedStorms);

  return (
    <DataList<AvgDateRow>
      data={data}
      keyExtractor={(row) => (filterType === "name" ? (row.name ?? "") : String(row.position))}
      sortFields={sortFields}
      onRowPress={(row) =>
        filterType === "name"
          ? onCellClick(row.name ?? "", "name")
          : onCellClick(row.position, "position")
      }
      renderCard={(row, index) => (
        <DataCard
          ordinal={index + 1}
          title={filterType === "name" ? (row.name ?? "") : getPositionTitle(row.position)}
          accentColor={getAvgDateColor(getDoyMonth(row.startDoy))}
          trailing={<Text style={styles.duration}>{formatDuration(row.avgDuration)}</Text>}
          fields={[
            {
              label: "Avg. season",
              value: (
                <Text>
                  <DateText doy={row.startDoy} />
                  <Text style={styles.separator}> – </Text>
                  <DateText doy={row.endDoy} />
                </Text>
              ),
              wide: true,
            },
            ...(filterType === "name"
              ? [{ label: "Position", value: getPositionTitle(row.position) }]
              : []),
            { label: "Storm count", value: String(row.count) },
            {
              label: "Contributed by",
              value: <CountryFlag country={row.country} size={16} showName />,
              wide: true,
            },
          ]}
          pressable
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    gap: 16,
  },
  date: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  separator: {
    color: "#94a3b8",
  },
  duration: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: "#334155",
    fontVariant: ["tabular-nums"],
  },
});

export default AvgDateView;
