import DefTable from "@/lib/components/DefTable";
import type { Storm } from "@/lib/types";
import { clickableRowProps } from "@/lib/utils/a11y";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import type { ColumnsType } from "antd/es/table";
import type { SeasonGroup } from "../../_utils/calendar";

interface SeasonRow {
  year: number;
  count: number;
  names: string[];
  storms: Storm[];
}

const NamesCell = ({ storms }: { storms: Storm[] }) => (
  <span className="flex flex-wrap gap-x-1.5 gap-y-0.5">
    {storms.map((storm, index) => (
      <span
        key={`${storm.name}-${index}`}
        className="font-semibold"
        style={{ color: TEXT_COLOR_WHITE_BACKGROUND[storm.intensity] }}
      >
        {storm.name}
        {index < storms.length - 1 && <span className="text-gray-400">,</span>}
      </span>
    ))}
  </span>
);

const columns: ColumnsType<SeasonRow> = [
  {
    title: "#",
    key: "order",
    width: 52,
    fixed: "left" as const,
    render: (_: unknown, __: SeasonRow, index: number) => (
      <span className="text-sm font-semibold text-sky-700">{index + 1}</span>
    ),
  },
  {
    title: "Season",
    dataIndex: "year",
    key: "year",
    width: 90,
    fixed: "left" as const,
    sorter: (a, b) => a.year - b.year,
    render: (_: unknown, row: SeasonRow) => <span className="font-semibold">{row.year}</span>,
  },
  {
    title: "Storms",
    dataIndex: "count",
    key: "count",
    width: 90,
    sorter: (a, b) => a.count - b.count,
    render: (_: unknown, row: SeasonRow) => (
      <span className="text-base font-bold tabular-nums">{row.count}</span>
    ),
  },
  {
    title: "Names",
    dataIndex: "names",
    key: "names",
    render: (_: unknown, row: SeasonRow) => <NamesCell storms={row.storms} />,
  },
];

interface CalendarSeasonTableProps {
  seasons: SeasonGroup[];
  // Distinguishes the three season tables so a sort on one does not carry into the next.
  tableKey: string;
  onSeasonClick: (season: SeasonGroup) => void;
}

const CalendarSeasonTable = ({ seasons, tableKey, onSeasonClick }: CalendarSeasonTableProps) => {
  const rows: SeasonRow[] = seasons.map(({ year, storms }) => ({
    year,
    count: storms.length,
    names: storms.map((storm) => storm.name),
    storms,
  }));

  return (
    <DefTable<SeasonRow>
      maxWidth="max-w-3xl"
      tableKey={tableKey}
      dataSource={rows}
      columns={columns}
      rowKey={(row) => String(row.year)}
      onRow={(row) =>
        clickableRowProps(`View the ${row.year} storms on this date`, () =>
          onSeasonClick({ year: row.year, storms: row.storms }),
        )
      }
    />
  );
};

export default CalendarSeasonTable;
