import CountryFlag from "@/lib/components/CountryFlag";
import DefTable from "@/lib/components/DefTable";
import IntensityBadge from "@/lib/components/IntensityBadge";
import { SORTING_RANK } from "@/lib/constants";
import type { IntensityType, Storm } from "@/lib/types";
import { parseStormDate } from "@/lib/utils/date";
import { getPositionTitle } from "@/lib/utils/position";
import type { ColumnsType } from "antd/es/table";

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

const intensityColumn: ColumnsType<StormRow>[number] = {
  title: "Intensity",
  dataIndex: "intensity",
  key: "intensity",
  sorter: (a, b) => SORTING_RANK[a.intensity] - SORTING_RANK[b.intensity],
  render: (_: unknown, record: StormRow) => <IntensityBadge intensity={record.intensity} />,
};

const buildColumns = (showIntensity: boolean): ColumnsType<StormRow> => [
  {
    title: "#",
    key: "order",
    width: 52,
    fixed: "left" as const,
    render: (_: unknown, __: StormRow, index: number) => (
      <span className="text-sm font-semibold text-sky-700">{index + 1}</span>
    ),
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    width: 100,
    fixed: "left" as const,
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (_: unknown, row: StormRow) => <span className="font-semibold">{row.name}</span>,
  },
  {
    title: "Year",
    dataIndex: "year",
    key: "year",
    sorter: (a, b) => a.year - b.year,
  },
  {
    title: "Month",
    key: "month",
    sorter: (a, b) => monthSortKey(a) - monthSortKey(b),
    render: (_: unknown, row: StormRow) => (
      <span>
        {row.startMonth}/{row.startYear}
      </span>
    ),
  },
  ...(showIntensity ? [intensityColumn] : []),
  {
    title: "Contributed By",
    dataIndex: "country",
    key: "country",
    sorter: (a, b) => a.country.localeCompare(b.country),
    render: (_: unknown, row: StormRow) => <CountryFlag country={row.country} />,
  },
  {
    title: "Position",
    dataIndex: "position",
    key: "position",
    sorter: (a, b) => a.position - b.position,
    render: (_: unknown, record: StormRow) => <span>{getPositionTitle(record.position)}</span>,
  },
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

interface StormRowsTableProps {
  storms: Storm[];
  tableKey: string;
  // Off where every row shares one intensity — the column would repeat a value the page title states.
  showIntensity?: boolean;
}

const StormRowsTable = ({ storms, tableKey, showIntensity = true }: StormRowsTableProps) => (
  <DefTable<StormRow>
    maxWidth={showIntensity ? "max-w-2xl" : "max-w-xl"}
    tableKey={tableKey}
    dataSource={storms.map(toRow)}
    columns={buildColumns(showIntensity)}
    rowKey={(r) => `${r.name}-${r.year}`}
  />
);

export default StormRowsTable;
