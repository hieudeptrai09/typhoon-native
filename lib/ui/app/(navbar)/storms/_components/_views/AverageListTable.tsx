import CountryFlag from "@/lib/components/CountryFlag";
import DefTable from "@/lib/components/DefTable";
import { MONTH_NAMES } from "@/lib/constants";
import type { Storm } from "@/lib/types";
import { clickableRowProps } from "@/lib/utils/a11y";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import { calculateAverage, getGroupedStorms, getIntensityFromNumber } from "@/lib/utils/storms";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { getEffectiveMonth } from "../../_utils/stats";

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
        return {
          name: key,
          country: storms[0].country,
          position: storms[0].position,
          ...base,
        };
      case "position":
      default:
        return {
          position: parseInt(key),
          country: storms[0].country,
          ...base,
        };
    }
  });

const AvgIntensityCell = ({ avgNumber, average }: { avgNumber: number; average: string }) => {
  const textColor = TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(avgNumber)];
  return (
    <span className="font-semibold" style={{ color: textColor }}>
      {average}
    </span>
  );
};

const makeColumns = (filterType: string): ColumnsType<AverageData> => {
  const orderCol: ColumnsType<AverageData>[number] = {
    title: "#",
    key: "order",
    width: 52,
    fixed: "left" as const,
    render: (_: unknown, __: AverageData, index: number) => (
      <span className="text-sm font-semibold text-sky-700">{index + 1}</span>
    ),
  };

  const countCol: ColumnsType<AverageData>[number] = {
    title: "Count",
    dataIndex: "count",
    key: "count",
    sorter: (a, b) => a.count - b.count,
  };

  const avgCol: ColumnsType<AverageData>[number] = {
    title: "Average Intensity",
    dataIndex: "average",
    key: "average",
    sorter: (a, b) => a.avgNumber - b.avgNumber,
    render: (_: unknown, row: AverageData) => (
      <AvgIntensityCell avgNumber={row.avgNumber} average={row.average} />
    ),
  };

  const countryCol: ColumnsType<AverageData>[number] = {
    title: "Contributed By",
    dataIndex: "country",
    key: "country",
    sorter: (a, b) => (a.country ?? "").localeCompare(b.country ?? ""),
    render: (_: unknown, row: AverageData) => <CountryFlag country={row.country ?? ""} />,
  };

  switch (filterType) {
    case "year":
      return [
        orderCol,
        {
          title: "Year",
          dataIndex: "year",
          key: "year",
          width: 80,
          fixed: "left" as const,
          sorter: (a, b) => (a.year ?? 0) - (b.year ?? 0),
        },
        countCol,
        avgCol,
      ];

    case "month":
      return [
        orderCol,
        {
          title: "Month",
          dataIndex: "monthName",
          key: "month",
          width: 120,
          fixed: "left" as const,
          sorter: (a, b) => (a.month ?? 0) - (b.month ?? 0),
        },
        countCol,
        avgCol,
      ];

    case "country":
      return [
        orderCol,
        {
          title: "Contributed By",
          dataIndex: "country",
          key: "country",
          width: 150,
          fixed: "left" as const,
          sorter: (a, b) => (a.country ?? "").localeCompare(b.country ?? ""),
          render: (_: unknown, row: AverageData) => <CountryFlag country={row.country ?? ""} />,
        },
        countCol,
        avgCol,
      ];

    case "name":
      return [
        orderCol,
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          width: 100,
          fixed: "left" as const,
          sorter: (a, b) => (a.name ?? "").localeCompare(b.name ?? ""),
          render: (_: unknown, row: AverageData) => (
            <span className="font-semibold">{row.name}</span>
          ),
        },
        countryCol,
        countCol,
        {
          title: "Position",
          dataIndex: "position",
          key: "position",
          sorter: (a, b) => (a.position ?? 0) - (b.position ?? 0),
          render: (_: unknown, row: AverageData) => (
            <span>{row.position !== undefined ? getPositionTitle(row.position) : ""}</span>
          ),
        },
        avgCol,
      ];

    case "position":
    default:
      return [
        orderCol,
        {
          title: "Position",
          dataIndex: "position",
          key: "position",
          width: 100,
          fixed: "left" as const,
          sorter: (a, b) => (a.position ?? 0) - (b.position ?? 0),
          render: (_: unknown, row: AverageData) => (
            <span>{row.position !== undefined ? getPositionTitle(row.position) : ""}</span>
          ),
        },
        countryCol,
        countCol,
        avgCol,
      ];
  }
};

const WIDTH_CLASS: Record<string, string> = {
  position: "max-w-2xl",
  name: "max-w-2xl",
  country: "max-w-lg",
  year: "max-w-lg",
  month: "max-w-lg",
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

const AverageListTable = ({ filter, stormsData, onCellClick }: AverageListTableProps) => {
  const groupedStorms = useMemo(() => {
    if (filter === "month") return groupByEffectiveMonth(stormsData);
    const filtered =
      filter === "year"
        ? stormsData.filter((s) => parseInt(s.year.toString()) >= 2000)
        : stormsData;
    return getGroupedStorms(filtered, filter);
  }, [stormsData, filter]);

  const data = transformData(groupedStorms, filter);
  if (filter === "month") data.sort((a, b) => (a.month ?? 0) - (b.month ?? 0));

  return (
    <DefTable<AverageData>
      maxWidth={WIDTH_CLASS[filter] ?? "max-w-2xl"}
      tableKey={filter}
      dataSource={data}
      columns={makeColumns(filter)}
      rowKey={(row) => {
        switch (filter) {
          case "year":
            return String(row.year);
          case "month":
            return String(row.month);
          case "country":
            return row.country ?? "";
          case "name":
            return `${row.name}-${row.country}`;
          case "position":
            return String(row.position);
          default:
            return String(Math.random());
        }
      }}
      onRow={(row) => {
        const value = row[filter as keyof AverageData];
        if (value === undefined) return {};
        return clickableRowProps(`View details for ${value}`, () =>
          onCellClick(value as number | string, filter),
        );
      }}
    />
  );
};

export default AverageListTable;
