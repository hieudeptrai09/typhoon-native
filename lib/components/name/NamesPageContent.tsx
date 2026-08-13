import StaleBanner from "@/lib/components/common/StaleBanner";
import type { NamesLayout, NamesScope } from "@/lib/components/name/options";
import NamesView from "@/lib/components/name/views/NamesView";
import RetiredView from "@/lib/components/name/views/RetiredView";
import NamesScopeTabs from "@/lib/components/name/widgets/NamesScopeTabs";
import type {
  FilterParams,
  RetiredFilterParams,
  RetiredName,
  StormHistoryEntry,
  SuggestionWithNameId,
} from "@/lib/types";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface NamesPageContentProps {
  allNames: RetiredName[];
  stormHistory: StormHistoryEntry[];
  suggestedNames: SuggestionWithNameId[];
  scope: NamesScope;
  onScopeChange: (scope: NamesScope) => void;
  layout: NamesLayout;
  onLayoutChange: (layout: NamesLayout) => void;
  showName: boolean;
  onShowNameChange: (showName: boolean) => void;
  nameFilters: FilterParams;
  onNameFiltersChange: (filters: FilterParams) => void;
  retiredFilters: RetiredFilterParams;
  onRetiredFiltersChange: (filters: RetiredFilterParams) => void;
  /** A refresh failed over data already on screen — worth saying, not worth a full error page. */
  staleError?: boolean;
}

const NamesPageContent = ({
  allNames,
  stormHistory,
  suggestedNames,
  scope,
  onScopeChange,
  layout,
  onLayoutChange,
  showName,
  onShowNameChange,
  nameFilters,
  onNameFiltersChange,
  retiredFilters,
  onRetiredFiltersChange,
  staleError = false,
}: NamesPageContentProps) => {
  const retiredNames = useMemo(() => allNames.filter((n) => n.isRetired), [allNames]);

  return (
    <View style={styles.root}>
      <NamesScopeTabs activeScope={scope} onChange={onScopeChange} />

      {staleError && <StaleBanner />}

      {scope === "retired" ? (
        <RetiredView
          retiredNames={retiredNames}
          suggestedNames={suggestedNames}
          filters={retiredFilters}
          onFiltersChange={onRetiredFiltersChange}
        />
      ) : (
        <NamesView
          allNames={allNames}
          stormHistory={stormHistory}
          layout={layout}
          showName={showName}
          showHistory={scope === "history"}
          filters={nameFilters}
          onLayoutChange={onLayoutChange}
          onShowNameChange={onShowNameChange}
          onFiltersChange={onNameFiltersChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default NamesPageContent;
