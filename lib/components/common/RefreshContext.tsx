import { COLOR } from "@/lib/constants/theme";
import { createContext, useContext, type ReactNode } from "react";
import { RefreshControl } from "react-native";

interface RefreshValue {
  refreshing: boolean;
  onRefresh: () => void;
}

const RefreshContext = createContext<RefreshValue | null>(null);

/**
 * A screen's data lives one component above the scrollers that should carry its pull-to-refresh,
 * and between them sit view switches that would otherwise each have to forward the same two props.
 * The scrollers pick it up from here instead.
 */
export const RefreshProvider = ({
  value,
  children,
}: {
  value: RefreshValue;
  children: ReactNode;
}) => <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>;

/** Ready-made control for a FlatList/ScrollView, or undefined outside a provider. */
export const useRefreshControl = () => {
  const value = useContext(RefreshContext);
  if (!value) return undefined;

  return (
    <RefreshControl
      refreshing={value.refreshing}
      onRefresh={value.onRefresh}
      colors={[COLOR.accent]}
      tintColor={COLOR.accent}
    />
  );
};
