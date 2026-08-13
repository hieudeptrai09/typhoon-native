import { useApiQuery } from "@/lib/api/client";
import { SortMemoryProvider } from "@/lib/components/common/DataList/sortMemory";
import FrownError from "@/lib/components/common/FrownError";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import NamesPageContent from "@/lib/components/name/NamesPageContent";
import type { NamesLayout, NamesScope } from "@/lib/components/name/options";
import type {
  FilterParams,
  RetiredFilterParams,
  RetiredName,
  StormHistoryEntry,
  SuggestionWithNameId,
} from "@/lib/types";
import { EMPTY_NAME_FILTERS, EMPTY_RETIRED_FILTERS } from "@/lib/utils/name/filters";
import { useState } from "react";

// The scope/layout toggles were URL segments on web only so the pages could be indexed. Here they
// are state, and they live on the screen rather than inside the views: a phone user hops between
// scopes far more than a web user hopped between pages, and rebuilding the filters every time
// makes each trip back a fresh start.
export default function NamesScreen() {
  const [scope, setScope] = useState<NamesScope>("current");
  const [layout, setLayout] = useState<NamesLayout>("grid");
  const [showName, setShowName] = useState(true);
  const [nameFilters, setNameFilters] = useState<FilterParams>(EMPTY_NAME_FILTERS);
  const [retiredFilters, setRetiredFilters] = useState<RetiredFilterParams>(EMPTY_RETIRED_FILTERS);

  const names = useApiQuery<RetiredName[]>("/api/v1/typhoon-names");

  // Both are only read by one scope each, so they stay unfetched until that scope is opened.
  const history = useApiQuery<StormHistoryEntry[]>(
    scope === "history" ? "/api/v1/storm-history" : null,
  );
  const suggested = useApiQuery<SuggestionWithNameId[]>(
    scope === "retired" ? "/api/v1/suggestions" : null,
  );

  if (names.isLoading) return <ScreenLoading />;
  if (!names.data) return <FrownError onRetry={names.refetch} />;

  return (
    <RefreshProvider value={{ refreshing: names.isRefetching, onRefresh: names.refetch }}>
      <SortMemoryProvider>
        <NamesPageContent
          allNames={names.data}
          stormHistory={history.data ?? []}
          suggestedNames={suggested.data ?? []}
          scope={scope}
          onScopeChange={setScope}
          layout={layout}
          onLayoutChange={setLayout}
          showName={showName}
          onShowNameChange={setShowName}
          nameFilters={nameFilters}
          onNameFiltersChange={setNameFilters}
          retiredFilters={retiredFilters}
          onRetiredFiltersChange={setRetiredFilters}
          staleError={names.isError}
        />
      </SortMemoryProvider>
    </RefreshProvider>
  );
}
