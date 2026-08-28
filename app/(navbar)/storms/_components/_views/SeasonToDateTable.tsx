import DefTable from "@/lib/components/DefTable";
import EmptyResults from "@/lib/components/EmptyResults";
import StatTile from "@/lib/components/StatTile";
import { clickableRowProps } from "@/lib/utils/a11y";
import { getSeasonPaceColor } from "@/lib/utils/colors";
import type { ColumnsType } from "antd/es/table";
import { Sigma } from "lucide-react";
import type { ReactNode } from "react";
import {
  averageToDate,
  averageTotal,
  isSeasonOngoing,
  NAMING_LIST_FIRST_YEAR,
  type SeasonToDateRow,
} from "../../_utils/calendar";

// Keeps a tile's headline number to the figure itself, with the qualifier alongside it.
const Unit = ({ children }: { children: ReactNode }) => (
  <span className="ml-1 text-xs font-normal text-foreground">{children}</span>
);

interface PaceRow extends SeasonToDateRow {
  delta: number; // storms ahead of (or behind) the average season by this date
  share: number | null; // null while the season is still running, with no final total to divide by
}

const columns: ColumnsType<PaceRow> = [
  {
    title: "#",
    key: "order",
    width: 52,
    fixed: "left" as const,
    render: (_: unknown, __: PaceRow, index: number) => (
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
    render: (_: unknown, row: PaceRow) => <span className="font-semibold">{row.year}</span>,
  },
  {
    title: "By This Date",
    dataIndex: "toDate",
    key: "toDate",
    sorter: (a, b) => a.toDate - b.toDate,
    render: (_: unknown, row: PaceRow) => (
      <span className="text-base font-bold tabular-nums">{row.toDate}</span>
    ),
  },
  {
    title: "vs. Average",
    dataIndex: "delta",
    key: "delta",
    sorter: (a, b) => a.delta - b.delta,
    render: (_: unknown, row: PaceRow) => (
      <span className="font-semibold tabular-nums" style={{ color: getSeasonPaceColor(row.delta) }}>
        {row.delta > 0 ? "+" : ""}
        {row.delta.toFixed(1)}
      </span>
    ),
  },
  {
    title: "Season Total",
    dataIndex: "total",
    key: "total",
    sorter: (a, b) => a.total - b.total,
  },
  {
    title: "Season Done",
    dataIndex: "share",
    key: "share",
    sorter: (a, b) => (a.share ?? -1) - (b.share ?? -1),
    render: (_: unknown, row: PaceRow) =>
      row.share === null ? (
        <span className="text-gray-400" title="This season is still running">
          &mdash;
        </span>
      ) : (
        <span className="font-semibold tabular-nums">{Math.round(row.share * 100)}%</span>
      ),
  },
];

interface SeasonToDateTableProps {
  rows: SeasonToDateRow[];
  onSeasonClick: (row: SeasonToDateRow) => void;
}

const SeasonToDateTable = ({ rows, onSeasonClick }: SeasonToDateTableProps) => {
  if (rows.length === 0) {
    return <EmptyResults description="No seasons to compare yet." icon={Sigma} />;
  }

  const average = averageToDate(rows);
  const fullSeason = averageTotal(rows);
  const paceRows: PaceRow[] = rows.map((row) => ({
    ...row,
    delta: row.toDate - average,
    share: isSeasonOngoing(row.year) || row.total === 0 ? null : row.toDate / row.total,
  }));

  // Ties go to the earlier season, which is the order the rows already arrive in.
  const busiest = paceRows.reduce((best, row) => (row.toDate > best.toDate ? row : best));
  const quietest = paceRows.reduce((worst, row) => (row.toDate < worst.toDate ? row : worst));

  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Average by this day"
          title={`Storms a season had produced by this day, averaged across the ${paceRows.length} seasons since ${NAMING_LIST_FIRST_YEAR}`}
        >
          {average.toFixed(1)}
          <Unit>storms</Unit>
        </StatTile>
        <StatTile
          label="Average full season"
          title={`Storms a whole season produces, averaged across the finished seasons since ${NAMING_LIST_FIRST_YEAR}`}
        >
          {fullSeason.toFixed(1)}
          <Unit>storms</Unit>
        </StatTile>
        <StatTile
          label="Most by this day"
          title={`No season had produced more by this day than ${busiest.year}`}
        >
          {busiest.toDate}
          <Unit>in {busiest.year}</Unit>
        </StatTile>
        <StatTile
          label="Fewest by this day"
          title={`No season had produced fewer by this day than ${quietest.year}`}
        >
          {quietest.toDate}
          <Unit>in {quietest.year}</Unit>
        </StatTile>
      </div>

      <DefTable<PaceRow>
        maxWidth="max-w-2xl"
        tableKey="calendar-todate"
        dataSource={paceRows}
        columns={columns}
        rowKey={(row) => String(row.year)}
        onRow={(row) =>
          clickableRowProps(`View the ${row.year} season month by month`, () => onSeasonClick(row))
        }
      />
    </div>
  );
};

export default SeasonToDateTable;
