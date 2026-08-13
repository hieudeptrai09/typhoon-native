import DefTable from "@/lib/components/DefTable";
import EmptyResults from "@/lib/components/EmptyResults";
import NameStatusIcon from "@/lib/components/NameStatusIcon";
import type { TyphoonName } from "@/lib/types";
import { clickableRowProps } from "@/lib/utils/a11y";
import { getNameStatusColorClass } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import type { ColumnsType } from "antd/es/table";

interface FilteredNamesTableProps {
  filteredNames: TyphoonName[];
  onNameClick: (name: TyphoonName) => void;
}

const columns: ColumnsType<TyphoonName> = [
  {
    title: "#",
    key: "order",
    width: 52,
    fixed: "left" as const,
    render: (_: unknown, __: TyphoonName, index: number) => (
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
    render: (_: unknown, record: TyphoonName) => (
      <span className={`font-semibold ${getNameStatusColorClass(record)}`}>{record.name}</span>
    ),
  },
  {
    title: "Retired",
    dataIndex: "isRetired",
    key: "isRetired",
    sorter: (a, b) => Number(a.isRetired) - Number(b.isRetired),
    render: (_: unknown, record: TyphoonName) => (
      <NameStatusIcon
        isRetired={record.isRetired}
        retirementReason={record.retirementReason}
        size={20}
      />
    ),
  },
  {
    title: "Contributed By",
    dataIndex: "country",
    key: "country",
    sorter: (a, b) => a.country.localeCompare(b.country),
  },
  {
    title: "Language",
    dataIndex: "language",
    key: "language",
    sorter: (a, b) => (a.language ?? "").localeCompare(b.language ?? ""),
  },
  {
    title: "Position",
    dataIndex: "position",
    key: "position",
    sorter: (a, b) => a.position - b.position,
    render: (_: unknown, record: TyphoonName) => <span>{getPositionTitle(record.position)}</span>,
  },
  {
    title: "Meaning",
    dataIndex: "meaning",
    key: "meaning",
    render: (_: unknown, record: TyphoonName) => (
      <span className="block max-w-[200px] wrap-break-word whitespace-normal">
        {record.meaning || "-"}
      </span>
    ),
  },
];

const FilteredNamesTable = ({ filteredNames, onNameClick }: FilteredNamesTableProps) => {
  if (filteredNames.length === 0) {
    return <EmptyResults />;
  }

  return (
    <DefTable<TyphoonName>
      maxWidth="max-w-4xl"
      dataSource={filteredNames}
      columns={columns}
      rowKey="id"
      onRow={(record) =>
        clickableRowProps(`View details for ${record.name}`, () => onNameClick(record))
      }
    />
  );
};

export default FilteredNamesTable;
