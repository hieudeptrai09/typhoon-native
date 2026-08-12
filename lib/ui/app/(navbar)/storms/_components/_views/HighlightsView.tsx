import CountryFlag from "@/lib/components/CountryFlag";
import DefTable from "@/lib/components/DefTable";
import IntensityBadge from "@/lib/components/IntensityBadge";
import { SORTING_RANK } from "@/lib/constants";
import type { DashboardParams, IntensityType, Storm } from "@/lib/types";
import { parseStormDate } from "@/lib/utils/date";
import { getPositionTitle } from "@/lib/utils/position";
import type { ColumnsType } from "antd/es/table";
import HighlightsGrid from "../_grids/HighlightsGrid";
import { getHighlights } from "../../_utils/stats";

interface HighlightsViewProps {
  params: DashboardParams;
  stormsData: Storm[];
}

interface HighlightRow {
  name: string;
  year: number;
  intensity: IntensityType;
  position: number;
  country: string;
  startMonth: number;
  startYear: number;
}

// A storm carried over from the previous season sorts before every January storm.
const monthSortKey = (row: HighlightRow): number => (row.startYear < row.year ? 0 : row.startMonth);

const columns: ColumnsType<HighlightRow> = [
  {
    title: "#",
    key: "order",
    width: 52,
    fixed: "left" as const,
    render: (_: unknown, __: HighlightRow, index: number) => (
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
    render: (_: unknown, row: HighlightRow) => <span className="font-semibold">{row.name}</span>,
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
    render: (_: unknown, row: HighlightRow) => (
      <span>
        {row.startMonth}/{row.startYear}
      </span>
    ),
  },
  {
    title: "Intensity",
    dataIndex: "intensity",
    key: "intensity",
    sorter: (a, b) => SORTING_RANK[a.intensity] - SORTING_RANK[b.intensity],
    render: (_: unknown, record: HighlightRow) => <IntensityBadge intensity={record.intensity} />,
  },
  {
    title: "Contributed By",
    dataIndex: "country",
    key: "country",
    sorter: (a, b) => a.country.localeCompare(b.country),
    render: (_: unknown, row: HighlightRow) => <CountryFlag country={row.country} />,
  },
  {
    title: "Position",
    dataIndex: "position",
    key: "position",
    sorter: (a, b) => a.position - b.position,
    render: (_: unknown, record: HighlightRow) => <span>{getPositionTitle(record.position)}</span>,
  },
];

const HighlightsView = ({ params, stormsData }: HighlightsViewProps) => {
  const highlights = getHighlights(stormsData, params.filter);

  if (params.mode === "table") {
    return (
      <HighlightsGrid
        stormsData={stormsData}
        highlightedStorms={highlights}
        highlightType={params.filter}
      />
    );
  }

  const highlightData: HighlightRow[] = highlights.map((s) => {
    const start = parseStormDate(s.dateStart);
    return {
      name: s.name,
      year: s.year,
      intensity: s.intensity,
      position: s.position,
      country: s.country,
      startMonth: start.month,
      startYear: start.year,
    };
  });

  return (
    <DefTable<HighlightRow>
      maxWidth="max-w-3xl"
      tableKey={params.filter}
      dataSource={highlightData}
      columns={columns}
      rowKey={(r) => `${r.name}-${r.year}`}
    />
  );
};

export default HighlightsView;
