import CountryFlag from "@/lib/components/common/CountryFlag";
import DataList, { DataCard } from "@/lib/components/common/DataList";
import EmptyResults from "@/lib/components/common/EmptyResults";
import { RETIRED_REASON_LABEL } from "@/lib/constants";
import type { RetiredName } from "@/lib/types";
import { getRetiredReasonColor } from "@/lib/utils/colors";
import { getPositionTitle } from "@/lib/utils/position";
import type { SortCriterion, SortField } from "@/lib/utils/table";

interface RetiredNamesTableProps {
  retiredNames: RetiredName[];
  onNamePress: (name: RetiredName) => void;
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

// Module-level so the identity is stable: DataList memoises the sorted rows off this.
const BY_NAME: SortCriterion[] = [{ key: "name", order: "ascend" }];

const indexField = {
  key: "name",
  letterOf: (name: RetiredName) => name.name.charAt(0).toUpperCase(),
};

const RetiredNamesTable = ({ retiredNames, onNamePress }: RetiredNamesTableProps) => {
  if (retiredNames.length === 0) return <EmptyResults />;

  return (
    <DataList<RetiredName>
      data={retiredNames}
      keyExtractor={(name) => String(name.id)}
      sortFields={sortFields}
      sortKey="retiredNames"
      defaultSort={BY_NAME}
      indexField={indexField}
      countLabel={(count) => `${count} retired name${count === 1 ? "" : "s"}`}
      onRowPress={onNamePress}
      renderCard={(name, index) => {
        const color = getRetiredReasonColor(name.retirementReason);
        return (
          <DataCard
            ordinal={index + 1}
            title={name.name}
            titleColor={color}
            accentColor={color}
            fields={[
              { label: "Last used", value: String(name.lastYear) },
              {
                label: "Contributed by",
                value: <CountryFlag country={name.country} size={16} showName />,
              },
              { label: "Position", value: getPositionTitle(name.position) },
              {
                label: "Reason",
                value: name.retirementReason
                  ? RETIRED_REASON_LABEL[name.retirementReason]
                  : "Retired",
              },
              { label: "Meaning", value: name.meaning || "—" },
            ]}
            pressable
          />
        );
      }}
    />
  );
};

export default RetiredNamesTable;
