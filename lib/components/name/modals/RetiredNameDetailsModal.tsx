import DefModal from "@/lib/components/common/DefModal";
import Tabs, { type Tab } from "@/lib/components/common/Tabs";
import NameDetailsContent from "@/lib/components/name/NameDetailsContent";
import SuggestionCard from "@/lib/components/name/widgets/SuggestionCard";
import { COLOR } from "@/lib/constants/theme";
import type { BaseModalProps, RetiredName, Suggestion } from "@/lib/types";
import { getRetiredReasonColor } from "@/lib/utils/colors";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export interface RetiredNameDetailsModalProps extends BaseModalProps {
  selectedName: RetiredName;
  suggestions: Suggestion[];
}

type TabType = "info" | "suggestions";

const SuggestionsList = ({ suggestions }: { suggestions: Suggestion[] }) => {
  if (suggestions.length === 0) {
    return <Text style={styles.empty}>No suggested replacements available</Text>;
  }

  return (
    <View style={styles.suggestions}>
      {suggestions.map((suggestion, index) => (
        <SuggestionCard key={index} suggestion={suggestion} />
      ))}
    </View>
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
    { key: "info", label: "Information", content: <NameDetailsContent name={selectedName} /> },
    {
      key: "suggestions",
      label: "Replacements",
      content: <SuggestionsList suggestions={suggestions} />,
    },
  ];

  return (
    <DefModal
      open={isOpen}
      onClose={onClose}
      title={
        <Text
          style={[styles.title, { color: getRetiredReasonColor(selectedName.retirementReason) }]}
          numberOfLines={1}
        >
          {selectedName.name}
        </Text>
      }
    >
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </DefModal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 22,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.textMuted,
    textAlign: "center",
    paddingVertical: 20,
  },
  suggestions: {
    gap: 12,
  },
});

export default RetiredNameDetailsModal;
