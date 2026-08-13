import { useApiQuery } from "@/lib/api/client";
import FrownError from "@/lib/components/common/FrownError";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import NamesPageContent from "@/lib/components/name/NamesPageContent";
import type { RetiredName, StormHistoryEntry, SuggestionWithNameId } from "@/lib/types";
import { defaultDisplayPrefs } from "@/lib/utils/name/displayPrefs";
import { isHistoryScope, type NamesSlugParams } from "@/lib/utils/name/routing";
import { useState } from "react";

// Same reasoning as the storms tab: the scope/layout toggles were URL segments on web only so the
// pages could be indexed. Here they are state, and NamesScopeTabs drives them directly.
export default function NamesScreen() {
  const [params, setParams] = useState<NamesSlugParams>({
    view: "grid",
    showName: true,
    showHistory: false,
  });

  const names = useApiQuery<RetiredName[]>("/api/v1/typhoon-names");

  // Both are only read by one scope each, so they stay unfetched until that scope is opened.
  const history = useApiQuery<StormHistoryEntry[]>(
    isHistoryScope(params) ? "/api/v1/storm-history" : null,
  );
  const suggested = useApiQuery<SuggestionWithNameId[]>(
    params.view === "retired" ? "/api/v1/suggestions" : null,
  );

  if (names.isLoading) return <ScreenLoading />;
  if (names.isError) return <FrownError onRetry={names.refetch} />;

  return (
    <NamesPageContent
      allNames={names.data}
      stormHistory={history.data ?? []}
      suggestedNames={suggested.data ?? []}
      displayPrefs={defaultDisplayPrefs}
      params={params}
      onParamsChange={setParams}
    />
  );
}
