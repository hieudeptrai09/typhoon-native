import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard, type DataField } from "@/lib/components/common/DataList";
import { MONTH_NAMES, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { getPositionTitle } from "@/lib/utils/position";
import {
  calculateAverage,
  getGroupedStorms,
  getIntensityFromNumber,
} from "@/lib/utils/storm/aggregate";
import { getEffectiveMonth } from "@/lib/utils/storm/highlights";
import type { SortField } from "@/lib/utils/table";
import { useMemo } from "react";

interface AverageListTableProps {
  filter: string;
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
}

interface AverageData {
  year?: number;
  country?: string;
  name?: string;
  position?: number;
  month?: number;
  monthName?: string;
  count: number;
  average: string;
  avgNumber: number;
}

const transformData = (dataMap: Record<string, Storm[]>, filterType: string): AverageData[] =>
  Object.entries(dataMap).map(([key, storms]) => {
    const avgValue = calculateAverage(storms);
    const base = { count: storms.length, average: avgValue.toFixed(2), avgNumber: avgValue };

    switch (filterType) {
      case "year":
        return { year: parseInt(key), ...base };
      case "month":
        return { month: parseInt(key), monthName: MONTH_NAMES[parseInt(key)], ...base };
      case "country":
        return { country: key, ...base };
      case "name":
        return { name: key, country: storms[0].country, position: storms[0].position, ...base };
      case "position":
      default:
        return { position: parseInt(key), country: storms[0].country, ...base };
    }
  });

const countField: SortField<AverageData> = {
  key: "count",
  label: "Count",
  compare: (a, b) => a.count - b.count,
};

const avgField: SortField<AverageData> = {
  key: "average",
  label: "Average intensity",
  compare: (a, b) => a.avgNumber - b.avgNumber,
};

const countryField: SortField<AverageData> = {
  key: "country",
  label: "Contributed by",
  compare: (a, b) => (a.country ?? "").localeCompare(b.country ?? ""),
};

const positionField: SortField<AverageData> = {
  key: "position",
  label: "Position",
  compare: (a, b) => (a.position ?? 0) - (b.position ?? 0),
};

const makeSortFields = (filterType: string): SortField<AverageData>[] => {
  switch (filterType) {
    case "year":
      return [
        { key: "year", label: "Year", compare: (a, b) => (a.year ?? 0) - (b.year ?? 0) },
        countField,
        avgField,
      ];
    case "month":
      return [
        { key: "month", label: "Month", compare: (a, b) => (a.month ?? 0) - (b.month ?? 0) },
        countField,
        avgField,
      ];
    case "country":
      return [countryField, countField, avgField];
    case "name":
      return [
        {
          key: "name",
          label: "Name",
          compare: (a, b) => (a.name ?? "").localeCompare(b.name ?? ""),
        },
        countryField,
        positionField,
        countField,
        avgField,
      ];
    case "position":
    default:
      return [positionField, countryField, countField, avgField];
  }
};

// Each filter groups by a different thing, so the card's headline changes with it.
const titleOf = (row: AverageData, filterType: string): string => {
  switch (filterType) {
    case "year":
      return String(row.year);
    case "month":
      return row.monthName ?? "";
    case "country":
      return row.country ?? "";
    case "name":
      return row.name ?? "";
    case "position":
    default:
      return row.position !== undefined ? getPositionTitle(row.position) : "";
  }
};

const fieldsOf = (row: AverageData, filterType: string): DataField[] => {
  const fields: DataField[] = [{ label: "Storm count", value: String(row.count) }];

  if (filterType === "name" && row.position !== undefined) {
    fields.push({ label: "Position", value: getPositionTitle(row.position) });
  }
  if (filterType !== "country" && filterType !== "year" && filterType !== "month" && row.country) {
    fields.push({
      label: "Contributed by",
      value: <CountryFlag country={row.country} size={16} showName />,
      wide: true,
    });
  }
  return fields;
};

const groupByEffectiveMonth = (stormsData: Storm[]): Record<string, Storm[]> => {
  const grouped: Record<string, Storm[]> = {};
  stormsData.forEach((storm) => {
    const month = getEffectiveMonth(storm);
    if (month === null) return;
    (grouped[String(month)] ??= []).push(storm);
  });
  return grouped;
};

const rowKey = (row: AverageData, filterType: string): string => {
  switch (filterType) {
    case "year":
      return String(row.year);
    case "month":
      return String(row.month);
    case "country":
      return row.country ?? "";
    case "name":
      return `${row.name}-${row.country}`;
    default:
      return String(row.position);
  }
};

const AverageListTable = ({ filter, stormsData, onCellClick }: AverageListTableProps) => {
  const groupedStorms = useMemo(() => {
    if (filter === "month") return groupByEffectiveMonth(stormsData);
    const filtered =
      filter === "year"
        ? stormsData.filter((storm) => parseInt(storm.year.toString()) >= 2000)
        : stormsData;
    return getGroupedStorms(filtered, filter);
  }, [stormsData, filter]);

  const data = useMemo(() => {
    const rows = transformData(groupedStorms, filter);
    if (filter === "month") rows.sort((a, b) => (a.month ?? 0) - (b.month ?? 0));
    return rows;
  }, [groupedStorms, filter]);

  const sortFields = useMemo(() => makeSortFields(filter), [filter]);

  return (
    <DataList<AverageData>
      data={data}
      keyExtractor={(row) => rowKey(row, filter)}
      sortFields={sortFields}
      sortKey={`average/${filter}`}
      onRowPress={(row) => {
        const value = row[filter as keyof AverageData];
        if (value === undefined) return;
        onCellClick(value as number | string, filter);
      }}
      renderCard={(row, index) => {
        const color = TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(row.avgNumber)];
        return (
          <DataCard
            ordinal={index + 1}
            title={
              filter === "country" && row.country ? (
                <CountryFlag country={row.country} size={20} showName />
              ) : (
                titleOf(row, filter)
              )
            }
            accentColor={color}
            trailing={row.average}
            fields={fieldsOf(row, filter)}
            pressable
          />
        );
      }}
    />
  );
};

export default AverageListTable;
