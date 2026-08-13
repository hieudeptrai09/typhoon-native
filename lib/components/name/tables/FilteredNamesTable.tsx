import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard } from "@/lib/components/common/DataList";
import EmptyResults from "@/lib/components/common/EmptyResults";
import NameStatusIcon from "@/lib/components/name/NameStatusIcon";
import type { TyphoonName } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import type { SortField } from "@/lib/utils/table";

interface FilteredNamesTableProps {
  filteredNames: TyphoonName[];
  onNameClick: (name: TyphoonName) => void;
}

const sortFields: SortField<TyphoonName>[] = [
  { key: "name", label: "Name", compare: (a, b) => a.name.localeCompare(b.name) },
  {
    key: "isRetired",
    label: "Retired",
    compare: (a, b) => Number(a.isRetired) - Number(b.isRetired),
  },
  {
    key: "country",
    label: "Contributed by",
    compare: (a, b) => a.country.localeCompare(b.country),
  },
  {
    key: "language",
    label: "Language",
    compare: (a, b) => (a.language ?? "").localeCompare(b.language ?? ""),
  },
  { key: "position", label: "Position", compare: (a, b) => a.position - b.position },
];

const FilteredNamesTable = ({ filteredNames, onNameClick }: FilteredNamesTableProps) => {
  if (filteredNames.length === 0) return <EmptyResults />;

  return (
    <DataList<TyphoonName>
      data={filteredNames}
      keyExtractor={(name) => String(name.id)}
      sortFields={sortFields}
      countLabel={(count) => `${count} name${count === 1 ? "" : "s"}`}
      onRowPress={onNameClick}
      renderCard={(name, index) => (
        <DataCard
          ordinal={index + 1}
          title={name.name}
          titleColor={getNameStatusColor(name)}
          accentColor={getNameStatusColor(name)}
          trailing={
            <NameStatusIcon
              isRetired={name.isRetired}
              retirementReason={name.retirementReason}
              size={20}
            />
          }
          fields={[
            {
              label: "Contributed by",
              value: <CountryFlag country={name.country} size={16} showName />,
            },
            { label: "Language", value: name.language || "—" },
            { label: "Position", value: getPositionTitle(name.position) },
            { label: "Meaning", value: name.meaning || "—", wide: true },
          ]}
          pressable
        />
      )}
    />
  );
};

export default FilteredNamesTable;
