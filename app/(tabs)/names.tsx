import { useApiQuery } from "@/lib/api/client";
import { SortMemoryProvider } from "@/lib/components/common/DataList/sortMemory";
import FrownError from "@/lib/components/common/FrownError";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import NamesPageContent from "@/lib/components/name/NamesPageContent";
import type { NamesScope } from "@/lib/components/name/options";
import type { FilterParams, RetiredFilterParams, RetiredName } from "@/lib/types";
import { EMPTY_NAME_FILTERS, EMPTY_RETIRED_FILTERS } from "@/lib/utils/name/filters";
import { useState } from "react";

export default function NamesScreen() {
  const [scope, setScope] = useState<NamesScope>("names");
  const [showHistory, setShowHistory] = useState(false);
  const [showName, setShowName] = useState(true);
  const [nameFilters, setNameFilters] = useState<FilterParams>(EMPTY_NAME_FILTERS);
  const [retiredFilters, setRetiredFilters] = useState<RetiredFilterParams>(EMPTY_RETIRED_FILTERS);

  const names = useApiQuery<RetiredName[]>("/api/v1/typhoon-names");

  if (names.isLoading) return <ScreenLoading />;
  if (!names.data) return <FrownError onRetry={names.refetch} />;

  return (
    <RefreshProvider value={{ refreshing: names.isRefetching, onRefresh: names.refetch }}>
      <SortMemoryProvider>
        <NamesPageContent
          allNames={names.data}
          scope={scope}
          onScopeChange={setScope}
          showHistory={showHistory}
          onShowHistoryChange={setShowHistory}
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
