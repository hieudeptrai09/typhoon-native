import CountryFlag from "@/lib/components/CountryFlag";
import DefTable from "@/lib/components/DefTable";
import type { DashboardParams, Storm } from "@/lib/types";
import { clickableRowProps } from "@/lib/utils/a11y";
import { getDistanceColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import { calculateDistances, formatDistance, getGroupedStorms } from "@/lib/utils/storms";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import DistanceGrid from "../_grids/DistanceGrid";
import SpecialButtons from "../_widgets/SpecialButtons";
import DistanceNameGrid from "./DistanceNameGrid";

interface DistanceViewProps {
  params: DashboardParams;
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
}

interface DistanceRow {
  position: number;
  name?: string;
  country: string;
  count: number;
  distanceNumber: number;
  distance: string;
}

const DistanceCell = ({
  distanceNumber,
  distance,
}: {
  distanceNumber: number;
  distance: string;
}) => (
  <span className="font-semibold" style={{ color: getDistanceColor(distanceNumber) }}>
    {distance}
  </span>
);

const makeColumns = (filterType: "position" | "name"): ColumnsType<DistanceRow> => {
  const orderCol: ColumnsType<DistanceRow>[number] = {
    title: "#",
    key: "order",
    width: 52,
    fixed: "left" as const,
    render: (_: unknown, __: DistanceRow, index: number) => (
      <span className="text-sm font-semibold text-sky-700">{index + 1}</span>
    ),
  };

  const positionCol: ColumnsType<DistanceRow>[number] = {
    title: "Position",
    dataIndex: "position",
    key: "position",
    sorter: (a, b) => a.position - b.position,
    render: (_: unknown, row: DistanceRow) => <span>{getPositionTitle(row.position)}</span>,
  };

  const countryCol: ColumnsType<DistanceRow>[number] = {
    title: "Contributed By",
    dataIndex: "country",
    key: "country",
    sorter: (a, b) => a.country.localeCompare(b.country),
    render: (_: unknown, row: DistanceRow) => <CountryFlag country={row.country} />,
  };

  const countCol: ColumnsType<DistanceRow>[number] = {
    title: "Storm Count",
    dataIndex: "count",
    key: "count",
    sorter: (a, b) => a.count - b.count,
  };

  const distanceCol: ColumnsType<DistanceRow>[number] = {
    title: "Avg Recurrence (years)",
    dataIndex: "distance",
    key: "distance",
    sorter: (a, b) => a.distanceNumber - b.distanceNumber,
    render: (_: unknown, row: DistanceRow) => (
      <DistanceCell distanceNumber={row.distanceNumber} distance={row.distance} />
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
        render: (_: unknown, row: DistanceRow) => <span className="font-semibold">{row.name}</span>,
      },
      countryCol,
      positionCol,
      countCol,
      distanceCol,
    ];
  }

  return [
    orderCol,
    { ...positionCol, width: 100, fixed: "left" as const },
    countryCol,
    countCol,
    distanceCol,
  ];
};

const buildRows = (
  filterType: "position" | "name",
  distanceMap: Record<string, number>,
  groupedStorms: Record<string, Storm[]>,
): DistanceRow[] =>
  Object.entries(distanceMap).map(([key, dist]) => {
    const storms = groupedStorms[key] || [];
    const base = {
      country: storms[0]?.country ?? "",
      count: storms.length,
      distanceNumber: dist,
      distance: formatDistance(dist),
    };
    return filterType === "name"
      ? { name: key, position: storms[0]?.position ?? 0, ...base }
      : { position: parseInt(key), ...base };
  });

const DistanceView = ({ params, stormsData, onCellClick }: DistanceViewProps) => {
  const filterType = (params.filter || "position") as "position" | "name";

  const distanceMap = useMemo(
    () => calculateDistances(stormsData, filterType),
    [stormsData, filterType],
  );

  const groupedStorms = useMemo(
    () => getGroupedStorms(stormsData, filterType),
    [stormsData, filterType],
  );

  const distanceValuesForGrid = useMemo<Record<number, number>>(() => {
    if (filterType !== "position") return {};
    const result: Record<number, number> = {};
    Object.entries(distanceMap).forEach(([k, v]) => {
      result[Number(k)] = v;
    });
    return result;
  }, [distanceMap, filterType]);

  if (params.mode === "table" && filterType === "name") {
    return <DistanceNameGrid stormsData={stormsData} onCellClick={onCellClick} />;
  }

  // position + table → special buttons + distance grid
  if (params.mode === "table" && filterType === "position") {
    return (
      <div className="flex flex-col gap-6">
        <DistanceGrid
          onCellClick={onCellClick}
          stormsData={stormsData}
          distanceValues={distanceValuesForGrid}
          isClickable
        />
        <SpecialButtons
          onCellClick={onCellClick}
          isAverageView={false}
          averageValues={null}
          distanceValues={distanceValuesForGrid}
        />
      </div>
    );
  }

  // position / name list → sortable distance table
  const data = buildRows(filterType, distanceMap, groupedStorms);

  return (
    <DefTable<DistanceRow>
      maxWidth="max-w-2xl"
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

export default DistanceView;
