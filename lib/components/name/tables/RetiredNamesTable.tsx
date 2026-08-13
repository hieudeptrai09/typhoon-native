import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard } from "@/lib/components/common/DataList";
import EmptyResults from "@/lib/components/common/EmptyResults";
import type { RetiredName } from "@/lib/types";
import { getRetiredReasonColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import type { SortField } from "@/lib/utils/table";

interface RetiredNamesTableProps {
  paginatedData: RetiredName[];
  onNameClick: (name: RetiredName) => void;
}

const sortFields: SortField<RetiredName>[] = [
  { key: "name", label: "Name", compare: (a, b) => a.name.localeCompare(b.name) },
  {
    key: "country",
    label: "Contributed by",
    compare: (a, b) => a.country.localeCompare(b.country),
  },
  { key: "position", label: "Position", compare: (a, b) => a.position - b.position },
  { key: "lastYear", label: "Last used", compare: (a, b) => a.lastYear - b.lastYear },
];

const RetiredNamesTable = ({ paginatedData, onNameClick }: RetiredNamesTableProps) => {
  if (!paginatedData || paginatedData.length === 0) return <EmptyResults />;

  return (
    <DataList<RetiredName>
      data={paginatedData}
      keyExtractor={(name) => String(name.id)}
      sortFields={sortFields}
      countLabel={(count) => `${count} retired name${count === 1 ? "" : "s"}`}
      onRowPress={onNameClick}
      renderCard={(name, index) => {
        const color = getRetiredReasonColor(name.retirementReason);
        return (
          <DataCard
            ordinal={index + 1}
            title={name.name}
            titleColor={color}
            accentColor={color}
            trailing={`Last used ${name.lastYear}`}
            fields={[
              {
                label: "Contributed by",
                value: <CountryFlag country={name.country} size={16} showName />,
              },
              { label: "Position", value: getPositionTitle(name.position) },
              { label: "Meaning", value: name.meaning || "—", wide: true },
              ...(name.note ? [{ label: "Note", value: name.note, wide: true }] : []),
            ]}
            pressable
          />
        );
      }}
    />
  );
};

export default RetiredNamesTable;
