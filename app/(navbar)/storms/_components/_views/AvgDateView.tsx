import CountryFlag from "@/lib/components/CountryFlag";
import DefTable from "@/lib/components/DefTable";
import type { DashboardParams, Storm } from "@/lib/types";
import { clickableRowProps } from "@/lib/utils/a11y";
import { getAvgDateColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import { getGroupedStorms } from "@/lib/utils/storms";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import AvgDateGrid from "../_grids/AvgDateGrid";
import SpecialButtons from "../_widgets/SpecialButtons";
import {
  calculateAvgDatesByGroup,
  calculateAvgDuration,
  formatDayOfYear,
  formatDuration,
  getDoyMonth,
  type AvgDates,
} from "@/lib/utils/stormDates";
import AvgDateNameGrid from "./AvgDateNameGrid";

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

const DateCell = ({ doy }: { doy: number }) => (
  <span className="font-semibold tabular-nums" style={{ color: getAvgDateColor(getDoyMonth(doy)) }}>
    {formatDayOfYear(doy)}
  </span>
);

// Widths track the column sets below: every extra column earns one more size.
const TABLE_MAX_WIDTH: Record<AvgDateFilter, string> = {
  position: "max-w-4xl",
  name: "max-w-5xl",
  country: "max-w-3xl",
  year: "max-w-3xl",
};

const makeColumns = (filterType: AvgDateFilter): ColumnsType<AvgDateRow> => {
  const orderCol: ColumnsType<AvgDateRow>[number] = {
    title: "#",
    key: "order",
    width: 52,
    fixed: "left" as const,
    render: (_: unknown, __: AvgDateRow, index: number) => (
      <span className="text-sm font-semibold text-sky-700">{index + 1}</span>
    ),
  };

  const positionCol: ColumnsType<AvgDateRow>[number] = {
    title: "Position",
    dataIndex: "position",
    key: "position",
    sorter: (a, b) => (a.position ?? 0) - (b.position ?? 0),
    render: (_: unknown, row: AvgDateRow) => (
      <span>{row.position !== undefined ? getPositionTitle(row.position) : ""}</span>
    ),
  };

  const countryCol: ColumnsType<AvgDateRow>[number] = {
    title: "Contributed By",
    dataIndex: "country",
    key: "country",
    sorter: (a, b) => (a.country ?? "").localeCompare(b.country ?? ""),
    render: (_: unknown, row: AvgDateRow) => <CountryFlag country={row.country ?? ""} />,
  };

  const countCol: ColumnsType<AvgDateRow>[number] = {
    title: "Storm Count",
    dataIndex: "count",
    key: "count",
    sorter: (a, b) => a.count - b.count,
  };

  const startCol: ColumnsType<AvgDateRow>[number] = {
    title: "Avg. Date Start",
    dataIndex: "start",
    key: "start",
    sorter: (a, b) => a.startDoy - b.startDoy,
    render: (_: unknown, row: AvgDateRow) => <DateCell doy={row.startDoy} />,
  };

  const endCol: ColumnsType<AvgDateRow>[number] = {
    title: "Avg. Date End",
    dataIndex: "end",
    key: "end",
    sorter: (a, b) => a.endDoy - b.endDoy,
    render: (_: unknown, row: AvgDateRow) => <DateCell doy={row.endDoy} />,
  };

  const durationCol: ColumnsType<AvgDateRow>[number] = {
    title: "Avg. Duration",
    dataIndex: "avgDuration",
    key: "duration",
    sorter: (a, b) => a.avgDuration - b.avgDuration,
    render: (_: unknown, row: AvgDateRow) => (
      <span className="font-semibold tabular-nums text-slate-700">
        {formatDuration(row.avgDuration)}
      </span>
    ),
  };

  switch (filterType) {
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
          render: (_: unknown, row: AvgDateRow) => (
            <span className="font-semibold">{row.name}</span>
          ),
        },
        countryCol,
        positionCol,
        countCol,
        startCol,
        endCol,
        durationCol,
      ];

    case "country":
      return [
        orderCol,
        { ...countryCol, width: 150, fixed: "left" as const },
        countCol,
        startCol,
        endCol,
        durationCol,
      ];

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
        startCol,
        endCol,
        durationCol,
      ];

    case "position":
    default:
      return [
        orderCol,
        { ...positionCol, width: 100, fixed: "left" as const },
        countryCol,
        countCol,
        startCol,
        endCol,
        durationCol,
      ];
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

// The naming list only starts in 2000, so earlier seasons would list years with
// a handful of storms apiece — the same cutoff the average-by-year list uses.
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

const rowLabelOf = (filterType: AvgDateFilter, row: AvgDateRow): string =>
  filterType === "position" ? getPositionTitle(row.position ?? 0) : rowKeyOf(filterType, row);

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
    Object.entries(avgDateMap).forEach(([k, v]) => {
      result[Number(k)] = v;
    });
    return result;
  }, [avgDateMap, filterType]);

  if (params.mode === "table" && filterType === "name") {
    return <AvgDateNameGrid stormsData={stormsData} onCellClick={onCellClick} />;
  }

  // position + table → special buttons + avg-date grid
  if (params.mode === "table" && filterType === "position") {
    return (
      <div className="flex flex-col gap-6">
        <AvgDateGrid
          onCellClick={onCellClick}
          stormsData={stormsData}
          avgDateValues={avgDateValuesForGrid}
          isClickable
        />
        <SpecialButtons onCellClick={onCellClick} avgDateValues={avgDateValuesForGrid} />
      </div>
    );
  }

  // every list mode → sortable avg-date table for the grouping
  const data = buildRows(filterType, avgDateMap, groupedStorms);
  if (filterType === "year") data.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));

  return (
    <DefTable<AvgDateRow>
      maxWidth={TABLE_MAX_WIDTH[filterType]}
      tableKey={filterType}
      dataSource={data}
      columns={makeColumns(filterType)}
      rowKey={(row) => rowKeyOf(filterType, row)}
      onRow={(row) => {
        const value = row[filterType];
        if (value === undefined) return {};
        return clickableRowProps(`View details for ${rowLabelOf(filterType, row)}`, () =>
          onCellClick(value, filterType),
        );
      }}
    />
  );
};

export default AvgDateView;
