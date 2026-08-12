"use client";

import FrownError from "@/lib/components/FrownError";
import PageHeader from "@/lib/components/PageHeader";
import type { RetiredName, StormHistoryEntry, SuggestionWithNameId } from "@/lib/types";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import NamesView from "./_components/_views/NamesView";
import RetiredView from "./_components/_views/RetiredView";
import type { NamesScope } from "./_components/_widgets/NamesScopeTabs";
import NamesScopeTabs from "./_components/_widgets/NamesScopeTabs";
import type { NamesDisplayPrefs } from "./_utils/displayPrefs";
import { getNamesTitle } from "./_utils/metadata";
import { paramsToPath, slugToParams } from "./_utils/routing";

interface NamesPageContentProps {
  allNames: RetiredName[] | null;
  stormHistory: StormHistoryEntry[];
  suggestedNames: SuggestionWithNameId[];
  displayPrefs: NamesDisplayPrefs;
}

const NamesPageContent = ({
  allNames,
  stormHistory,
  suggestedNames,
  displayPrefs,
}: NamesPageContentProps) => {
  const { slug } = useParams<{ slug: string[] }>();
  const params = slugToParams(slug);

  const retiredNames = useMemo(() => (allNames || []).filter((n) => n.isRetired), [allNames]);

  const activeScope: NamesScope =
    params.view === "retired" ? "retired" : params.showHistory ? "history" : "current";

  // From the retired view there is no grid/list context to preserve, so fall back to the grid.
  const layout = params.view === "list" ? "list" : "grid";
  const scopeShowName = params.view === "grid" ? params.showName : true;

  // Switching scope keeps the layout and name toggle the current view is already showing.
  const scopeHref = (showHistory: boolean): string =>
    paramsToPath(
      layout === "list"
        ? { view: "list", showHistory }
        : { view: "grid", showName: scopeShowName, showHistory },
    );

  const scopeHrefs: Record<NamesScope, string> = {
    current: scopeHref(false),
    history: scopeHref(true),
    retired: paramsToPath({ view: "retired" }),
  };

  if (!allNames) {
    return <FrownError />;
  }

  return (
    <PageHeader title={getNamesTitle(params)}>
      <NamesScopeTabs activeScope={activeScope} hrefs={scopeHrefs} />

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
    </PageHeader>
  );
};

export default NamesPageContent;
