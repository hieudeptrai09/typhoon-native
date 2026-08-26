import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard } from "@/lib/components/common/DataList";
import ScreenScroll from "@/lib/components/common/ScreenScroll";
import AvgDateGrid from "@/lib/components/dashboard/grids/AvgDateGrid";
import AvgDateNameGrid from "@/lib/components/dashboard/views/AvgDateNameGrid";
import SpecialButtons from "@/lib/components/dashboard/widgets/SpecialButtons";
import { COLOR } from "@/lib/constants/theme";
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
import { useMemo, type ReactNode } from "react";
import { StyleSheet, Text } from "react-native";

interface AvgDateViewProps {
  params: DashboardParams;
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
}

type AvgDateFilter = "position" | "name" | "country" | "year";

interface AvgDateRow {
  position?: number;
  name?: string;
  country?: string;
  year?: number;
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
  compare: (a, b) => (a.position ?? 0) - (b.position ?? 0),
};

const countryField: SortField<AvgDateRow> = {
  key: "country",
  label: "Contributed by",
  compare: (a, b) => (a.country ?? "").localeCompare(b.country ?? ""),
};

const yearField: SortField<AvgDateRow> = {
  key: "year",
  label: "Year",
  compare: (a, b) => (a.year ?? 0) - (b.year ?? 0),
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

const makeSortFields = (filterType: AvgDateFilter): SortField<AvgDateRow>[] => {
  const tail = [countField, startField, endField, durationField];

  switch (filterType) {
    case "name":
      return [nameField, countryField, positionField, ...tail];
    case "country":
      return [countryField, ...tail];
    case "year":
      return [yearField, ...tail];
    case "position":
    default:
      return [positionField, countryField, ...tail];
  }
};

const buildRows = (
  filterType: AvgDateFilter,
  avgDateMap: Record<string, AvgDates>,
  groupedStorms: Record<string, Storm[]>,
): AvgDateRow[] =>
  Object.entries(avgDateMap).map(([key, dates]) => {
    const storms = groupedStorms[key] || [];
    const base = {
      count: storms.length,
      startDoy: dates.startDoy,
      endDoy: dates.endDoy,
      avgDuration: calculateAvgDuration(storms),
    };

    switch (filterType) {
      case "name":
        return {
          name: key,
          country: storms[0]?.country ?? "",
          position: storms[0]?.position ?? 0,
          ...base,
        };
      case "country":
        return { country: key, ...base };
      case "year":
        return { year: parseInt(key), ...base };
      case "position":
      default:
        return { position: parseInt(key), country: storms[0]?.country ?? "", ...base };
    }
  });

// The naming list only starts in 2000; earlier seasons are a few storms apiece. Same cutoff as the
// average-by-year list, so the two views agree on which years exist.
const YEAR_CUTOFF = 2000;

const rowKeyOf = (filterType: AvgDateFilter, row: AvgDateRow): string => {
  switch (filterType) {
    case "name":
      return row.name ?? "";
    case "country":
      return row.country ?? "";
    case "year":
      return String(row.year);
    case "position":
    default:
      return String(row.position);
  }
};

const titleOf = (filterType: AvgDateFilter, row: AvgDateRow): ReactNode => {
  switch (filterType) {
    case "country":
      return <CountryFlag country={row.country ?? ""} size={20} showName />;
    case "position":
      return getPositionTitle(row.position ?? 0);
    default:
      return rowKeyOf(filterType, row);
  }
};

const AvgDateView = ({ params, stormsData, onCellClick }: AvgDateViewProps) => {
  const filterType = (params.filter || "position") as AvgDateFilter;

  const groupSource = useMemo(
    () => (filterType === "year" ? stormsData.filter((s) => s.year >= YEAR_CUTOFF) : stormsData),
    [stormsData, filterType],
  );

  const avgDateMap = useMemo(
    () => calculateAvgDatesByGroup(groupSource, filterType),
    [groupSource, filterType],
  );

  const groupedStorms = useMemo(
    () => getGroupedStorms(groupSource, filterType),
    [groupSource, filterType],
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
      <ScreenScroll>
        <AvgDateGrid
          onCellClick={onCellClick}
          stormsData={stormsData}
          avgDateValues={avgDateValuesForGrid}
          isClickable
        />
        <SpecialButtons onCellClick={onCellClick} avgDateValues={avgDateValuesForGrid} />
      </ScreenScroll>
    );
  }

  const data = buildRows(filterType, avgDateMap, groupedStorms);
  if (filterType === "year") data.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));

  return (
    <DataList<AvgDateRow>
      data={data}
      keyExtractor={(row) => rowKeyOf(filterType, row)}
      sortFields={sortFields}
      sortKey={`avgdate/${filterType}`}
      onRowPress={(row) => {
        const value = row[filterType];
        if (value === undefined) return;
        onCellClick(value, filterType);
      }}
      renderCard={(row, index) => (
        <DataCard
          ordinal={index + 1}
          title={titleOf(filterType, row)}
          accentColor={getAvgDateColor(getDoyMonth(row.startDoy))}
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
            },
            {
              label: "Avg. duration",
              value: <Text style={styles.duration}>{formatDuration(row.avgDuration)}</Text>,
            },
            ...(filterType === "name"
              ? [{ label: "Position", value: getPositionTitle(row.position ?? 0) }]
              : []),
            { label: "Storm count", value: String(row.count) },
            ...(row.country && filterType !== "country"
              ? [
                  {
                    label: "Contributed by",
                    value: <CountryFlag country={row.country} size={16} showName />,
                  },
                ]
              : []),
          ]}
          pressable
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  date: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  separator: {
    color: COLOR.textFaint,
  },
  duration: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    lineHeight: 19,
    color: COLOR.text,
    fontVariant: ["tabular-nums"],
  },
});

export default AvgDateView;
