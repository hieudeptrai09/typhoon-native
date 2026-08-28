import StaleBanner from "@/lib/components/common/StaleBanner";
import type { NamesScope } from "@/lib/components/name/options";
import NamesView from "@/lib/components/name/views/NamesView";
import RetiredView from "@/lib/components/name/views/RetiredView";
import NamesScopeTabs from "@/lib/components/name/widgets/NamesScopeTabs";
import type { FilterParams, RetiredFilterParams, RetiredName } from "@/lib/types";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface NamesPageContentProps {
  allNames: RetiredName[];
  scope: NamesScope;
  onScopeChange: (scope: NamesScope) => void;
  showHistory: boolean;
  onShowHistoryChange: (showHistory: boolean) => void;
  showName: boolean;
  onShowNameChange: (showName: boolean) => void;
  nameFilters: FilterParams;
  onNameFiltersChange: (filters: FilterParams) => void;
  retiredFilters: RetiredFilterParams;
  onRetiredFiltersChange: (filters: RetiredFilterParams) => void;
  staleError?: boolean;
}

const NamesPageContent = ({
  allNames,
  scope,
  onScopeChange,
  showHistory,
  onShowHistoryChange,
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
          filters={retiredFilters}
          onFiltersChange={onRetiredFiltersChange}
        />
      ) : (
        <NamesView
          allNames={allNames}
          showHistory={showHistory}
          showName={showName}
          filters={nameFilters}
          onShowHistoryChange={onShowHistoryChange}
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
