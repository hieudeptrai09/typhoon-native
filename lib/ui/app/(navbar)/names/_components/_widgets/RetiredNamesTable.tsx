import DefTable from "@/lib/components/DefTable";
import EmptyResults from "@/lib/components/EmptyResults";
import type { RetiredName } from "@/lib/types";
import { clickableRowProps } from "@/lib/utils/a11y";
import { getRetiredReasonColorClass } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import type { ColumnsType } from "antd/es/table";

interface RetiredNamesTableProps {
  paginatedData: RetiredName[];
  onNameClick: (name: RetiredName) => void;
}

const columns: ColumnsType<RetiredName> = [
  {
    title: "#",
    key: "order",
    width: 52,
    fixed: "left" as const,
    render: (_: unknown, __: RetiredName, index: number) => (
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
    render: (_: unknown, record: RetiredName) => (
      <span className={`font-semibold ${getRetiredReasonColorClass(record.retirementReason)}`}>
        {record.name}
      </span>
    ),
  },
  {
    title: "Meaning",
    dataIndex: "meaning",
    key: "meaning",
    render: (_: unknown, record: RetiredName) => (
      <span className="block max-w-[200px] wrap-break-word whitespace-normal">
        {record.meaning || "-"}
      </span>
    ),
  },
  {
    title: "Contributed By",
    dataIndex: "country",
    key: "country",
    sorter: (a, b) => a.country.localeCompare(b.country),
  },
  {
    title: "Position",
    dataIndex: "position",
    key: "position",
    sorter: (a, b) => a.position - b.position,
    render: (_: unknown, record: RetiredName) => <span>{getPositionTitle(record.position)}</span>,
  },
  {
    title: "Note",
    dataIndex: "note",
    key: "note",
    render: (_: unknown, record: RetiredName) => (
      <span className="block max-w-[200px] wrap-break-word whitespace-normal">
        {record.note || "-"}
      </span>
    ),
  },
  {
    title: "Last used",
    dataIndex: "lastYear",
    key: "lastYear",
    sorter: (a, b) => a.lastYear - b.lastYear,
  },
];

const RetiredNamesTable = ({ paginatedData, onNameClick }: RetiredNamesTableProps) => {
  if (!paginatedData || paginatedData.length === 0) {
    return <EmptyResults />;
  }

  return (
    <DefTable<RetiredName>
      maxWidth="max-w-5xl"
      dataSource={paginatedData}
      columns={columns}
      rowKey="id"
      onRow={(record) =>
        clickableRowProps(`View details for ${record.name}`, () => onNameClick(record))
      }
    />
  );
};

export default RetiredNamesTable;
