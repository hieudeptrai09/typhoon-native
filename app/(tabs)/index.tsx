import { useApiQuery } from "@/lib/api/client";
import FunFactCard from "@/lib/components/home/FunFactCard";
import NowCard from "@/lib/components/home/NowCard";
import OnThisDayCard from "@/lib/components/home/OnThisDayCard";
import SeasonCard from "@/lib/components/home/SeasonCard";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { ActiveOnThisDayStorm, OnThisDayStorm, Storm, StormHighlight } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

export default function TodayScreen() {
  const today = new Date();
  const dayParams = `day=${today.getDate()}&month=${today.getMonth() + 1}`;

  const highlight = useApiQuery<StormHighlight[]>("/api/v1/storm-highlight");
  const storms = useApiQuery<Storm[]>("/api/v1/storms");
  const events = useApiQuery<OnThisDayStorm[]>(`/api/v1/on-this-day?${dayParams}`);
  const active = useApiQuery<ActiveOnThisDayStorm[]>(`/api/v1/on-this-day-active?${dayParams}`);
  const fact = useApiQuery<string | null>("/api/v1/random-fact");

  const isAnyLoading =
    highlight.isLoading ||
    storms.isLoading ||
    events.isLoading ||
    active.isLoading ||
    fact.isLoading;

  const [isRefreshing, setIsRefreshing] = useState(false);
  // refetch() only flips isLoading on the render after the one that queued it, so clearing the
  // spinner on "nothing is loading" alone would end it before the requests even start.
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isRefreshing) return;
    if (isAnyLoading) {
      hasStarted.current = true;
      return;
    }
    if (hasStarted.current) {
      hasStarted.current = false;
      setIsRefreshing(false);
    }
  }, [isRefreshing, isAnyLoading]);

  const onRefresh = () => {
    setIsRefreshing(true);
    highlight.refetch();
    storms.refetch();
    events.refetch();
    active.refetch();
    fact.refetch();
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={COLOR.accent}
          colors={[COLOR.accent]}
        />
      }
    >
      <NowCard query={highlight} />
      <SeasonCard query={storms} />
      <OnThisDayCard events={events} active={active} />
      <FunFactCard query={fact} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.lg,
    paddingBottom: SPACE.xl,
    gap: SPACE.lg,
  },
});
