import { useQuery } from "@/lib/api/client";
import FunFactCard from "@/lib/components/home/FunFactCard";
import NowCard from "@/lib/components/home/NowCard";
import OnThisDayCard from "@/lib/components/home/OnThisDayCard";
import SeasonCard from "@/lib/components/home/SeasonCard";
import { COLOR, SPACE } from "@/lib/constants/theme";
import { getRandomFact } from "@/lib/data/getRandomFact";
import { getStormHighlight } from "@/lib/data/getStormHighlight";
import { getStorms } from "@/lib/data/getStorms";
import { useEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

export default function TodayScreen() {
  // Neither is cached: the highlight is the app's "what is happening right now" surface, and a
  // fact repeated on every tap of the shuffle button is not a shuffle.
  const highlight = useQuery("storm-highlight", getStormHighlight, { ttl: 0 });
  const storms = useQuery("storms", getStorms);
  const fact = useQuery("random-fact", getRandomFact, { ttl: 0 });

  const isAnyLoading = highlight.isLoading || storms.isLoading || fact.isLoading;

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
      <OnThisDayCard query={storms} />
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
