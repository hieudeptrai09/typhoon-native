import FrownError from "@/lib/components/common/FrownError";
import NamesView from "@/lib/components/name/views/NamesView";
import RetiredView from "@/lib/components/name/views/RetiredView";
import NamesScopeTabs, { type NamesScope } from "@/lib/components/name/widgets/NamesScopeTabs";
import type { RetiredName, StormHistoryEntry, SuggestionWithNameId } from "@/lib/types";
import type { NamesDisplayPrefs } from "@/lib/utils/name/displayPrefs";
import type { NamesSlugParams } from "@/lib/utils/name/routing";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface NamesPageContentProps {
  allNames: RetiredName[] | null;
  stormHistory: StormHistoryEntry[];
  suggestedNames: SuggestionWithNameId[];
  displayPrefs: NamesDisplayPrefs;
  params: NamesSlugParams;
  onParamsChange: (params: NamesSlugParams) => void;
}

const NamesPageContent = ({
  allNames,
  stormHistory,
  suggestedNames,
  displayPrefs,
  params,
  onParamsChange,
}: NamesPageContentProps) => {
  const retiredNames = useMemo(() => (allNames || []).filter((n) => n.isRetired), [allNames]);

  const activeScope: NamesScope =
    params.view === "retired" ? "retired" : params.showHistory ? "history" : "current";

  // From the retired view there is no grid/list context to preserve, so fall back to the grid.
  const layout = params.view === "list" ? "list" : "grid";
  const scopeShowName = params.view === "grid" ? params.showName : true;

  // Switching scope keeps the layout and name toggle the current view is already showing.
  const handleScopeChange = (scope: NamesScope) => {
    if (scope === "retired") {
      onParamsChange({ view: "retired" });
      return;
    }

    const showHistory = scope === "history";
    onParamsChange(
      layout === "list"
        ? { view: "list", showHistory }
        : { view: "grid", showName: scopeShowName, showHistory },
    );
  };

  if (!allNames) {
    return <FrownError />;
  }

  return (
    <View style={styles.root}>
      <NamesScopeTabs activeScope={activeScope} onChange={handleScopeChange} />

      {params.view === "retired" ? (
        <RetiredView
          retiredNames={retiredNames}
          suggestedNames={suggestedNames}
          displayPrefs={displayPrefs}
        />
      ) : (
        <NamesView
          allNames={allNames}
          stormHistory={stormHistory}
          viewMode={params.view}
          showName={params.view === "grid" && params.showName}
          showHistory={params.showHistory}
          displayPrefs={displayPrefs}
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
