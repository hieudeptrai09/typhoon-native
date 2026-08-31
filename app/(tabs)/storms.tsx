import { useQuery } from "@/lib/api/client";
import { SortMemoryProvider } from "@/lib/components/common/DataList/sortMemory";
import FrownError from "@/lib/components/common/FrownError";
import { RefreshProvider } from "@/lib/components/common/RefreshContext";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import DashboardPageContent from "@/lib/components/dashboard/DashboardPageContent";
import { getStorms } from "@/lib/data/getStorms";
import type { DashboardParams } from "@/lib/types";
import { usePersistedState } from "@/lib/utils/persistedState";
import { normalizeParams, paramsForView } from "@/lib/utils/storm/routing";
import { useCallback, useEffect, useMemo, useRef } from "react";

const STORAGE_KEY = "storms.params";

export default function StormsScreen() {
  const [stored, setStored] = usePersistedState<DashboardParams>(STORAGE_KEY, paramsForView("all"));
  const params = useMemo(() => normalizeParams(stored), [stored]);

  // Each view keeps the axes it was last left on, so flipping between them does not throw away a
  // grouping the reader had just set up. A ref, not state: nothing renders off it.
  const byView = useRef<Record<string, DashboardParams>>({});
  useEffect(() => {
    byView.current[params.view] = params;
  }, [params]);

  const { data, isLoading, isError, isRefetching, refetch } = useQuery("storms", getStorms);

  const refreshValue = useMemo(
    () => ({ refreshing: isRefetching, onRefresh: refetch }),
    [isRefetching, refetch],
  );

  const selectView = useCallback(
    (view: string) => setStored(byView.current[view] ?? paramsForView(view)),
    [setStored],
  );

  if (isLoading) return <ScreenLoading />;
  if (isError && !data) return <FrownError onRetry={refetch} />;

  return (
    <RefreshProvider value={refreshValue}>
      <SortMemoryProvider>
        <DashboardPageContent
          stormsData={data}
          params={params}
          onParamsChange={setStored}
          onSelectView={selectView}
          staleError={isError}
        />
      </SortMemoryProvider>
    </RefreshProvider>
  );
}
