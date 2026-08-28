import DefModal from "@/lib/components/DefModal";
import NameDetailsContent from "@/lib/components/NameDetailsContent";
import Tabs, { type Tab } from "@/lib/components/Tabs";
import type { BaseModalProps, RetiredName, Suggestion } from "@/lib/types";
import { getRetiredReasonColorClass } from "@/lib/utils/colors";
import { useState } from "react";
import SuggestionCard from "../_widgets/SuggestionCard";

export interface RetiredNameDetailsModalProps extends BaseModalProps {
  selectedName: RetiredName;
  suggestions: Suggestion[];
}

type TabType = "info" | "suggestions";

const SuggestionsList = ({ suggestions }: { suggestions: Suggestion[] }) => {
  if (suggestions.length === 0) {
    return (
      <div className="py-4 text-center text-foreground">No suggested replacements available</div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      {suggestions.map((suggestion, sidx) => (
        <SuggestionCard key={sidx} suggestion={suggestion} />
      ))}
    </div>
  );
};

const RetiredNameDetailsModal = ({
  isOpen,
  onClose,
  selectedName,
  suggestions,
}: RetiredNameDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("info");

  if (!selectedName) return null;

  const tabs: Tab<TabType>[] = [
    { key: "info", label: "Name Information", content: <NameDetailsContent name={selectedName} /> },
    {
      key: "suggestions",
      label: "Suggested Replacements",
      content: <SuggestionsList suggestions={suggestions} />,
    },
  ];

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      width={600}
      title={
        <span
          className={`text-2xl font-bold ${getRetiredReasonColorClass(selectedName.retirementReason)}`}
        >
          {selectedName.name}
        </span>
      }
    >
      <div className="pt-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          ariaLabel="Name details tabs"
          idPrefix="tabpanel"
        />
      </div>
    </DefModal>
  );
};

export default RetiredNameDetailsModal;
