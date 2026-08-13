import { useApiQuery } from "@/lib/api/client";
import EmptyResults from "@/lib/components/common/EmptyResults";
import FrownError from "@/lib/components/common/FrownError";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import PositionPageContent from "@/lib/components/position/PositionPageContent";
import type { PositionDetail } from "@/lib/types";
import { getPositionFromSlug, getPositionTitle } from "@/lib/utils/position";
import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

const TOTAL_POSITIONS = 143;

const isValidPosition = (position: number | null): position is number =>
  position !== null && Number.isInteger(position) && position >= 1 && position <= TOTAL_POSITIONS;

export default function PositionScreen() {
  const { position: slug = "" } = useLocalSearchParams<{ position: string }>();

  // getPositionFromSlug accepts every spelling a deep link can carry ("3i", "3I", "37"), so there
  // is nothing to redirect to — the web version normalised the URL only to keep one canonical link.
  const position = getPositionFromSlug(slug);
  const isKnown = isValidPosition(position);

  const { data, isLoading, isError, isNotFound, refetch } = useApiQuery<PositionDetail>(
    isKnown ? `/api/v1/position-detail?position=${position}` : null,
  );

  return (
    <>
      <Stack.Screen options={{ title: isKnown ? getPositionTitle(position) : "Position" }} />

      {!isKnown || isNotFound ? (
        <View style={styles.state}>
          <EmptyResults
            icon="help-circle-outline"
            description={`There is no naming position "${slug}".`}
          />
        </View>
      ) : isLoading ? (
        <ScreenLoading />
      ) : isError ? (
        <FrownError onRetry={refetch} />
      ) : (
        <PositionPageContent detail={data} position={position} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    justifyContent: "center",
  },
});
