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

interface AvgDateRow {
  position: number;
  name?: string;
  country: string;
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

// Widths track the column sets below: the name table carries an extra Name
// column, so it needs one size more room than the position table.
const TABLE_MAX_WIDTH: Record<"position" | "name", string> = {
  position: "max-w-4xl",
  name: "max-w-5xl",
};

const makeColumns = (filterType: "position" | "name"): ColumnsType<AvgDateRow> => {
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
    sorter: (a, b) => a.position - b.position,
    render: (_: unknown, row: AvgDateRow) => <span>{getPositionTitle(row.position)}</span>,
  };

  const countryCol: ColumnsType<AvgDateRow>[number] = {
    title: "Contributed By",
    dataIndex: "country",
    key: "country",
    sorter: (a, b) => a.country.localeCompare(b.country),
    render: (_: unknown, row: AvgDateRow) => <CountryFlag country={row.country} />,
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

  if (filterType === "name") {
    return [
      orderCol,
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 100,
        fixed: "left" as const,
        sorter: (a, b) => (a.name ?? "").localeCompare(b.name ?? ""),
        render: (_: unknown, row: AvgDateRow) => <span className="font-semibold">{row.name}</span>,
      },
      countryCol,
      positionCol,
      countCol,
      startCol,
      endCol,
      durationCol,
    ];
  }

  return [
    orderCol,
    { ...positionCol, width: 100, fixed: "left" as const },
    countryCol,
    countCol,
    startCol,
    endCol,
    durationCol,
  ];
};

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

  // position / name list → sortable avg-date table
  const data = buildRows(filterType, avgDateMap, groupedStorms);

  return (
    <DefTable<AvgDateRow>
      maxWidth={TABLE_MAX_WIDTH[filterType]}
      tableKey={filterType}
      dataSource={data}
      columns={makeColumns(filterType)}
      rowKey={(row) => (filterType === "name" ? (row.name ?? "") : String(row.position))}
      onRow={(row) =>
        filterType === "name"
          ? clickableRowProps(`View details for ${row.name}`, () =>
              onCellClick(row.name ?? "", "name"),
            )
          : clickableRowProps(`View details for ${getPositionTitle(row.position)}`, () =>
              onCellClick(row.position, "position"),
            )
      }
    />
  );
};

export default AvgDateView;
