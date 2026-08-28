import type { QueryState } from "@/lib/api/client";
import HomeCard from "@/lib/components/home/HomeCard";
import { COLOR, SPACE } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface FunFactCardProps {
  query: QueryState<string | null>;
}

const FunFactCard = ({ query }: FunFactCardProps) => {
  const { data, isLoading, isError, refetch } = query;

  return (
    <HomeCard
      icon="bulb-outline"
      title="Did you know?"
      action={
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            refetch();
          }}
          hitSlop={12}
          style={({ pressed }) => [pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Show another fact"
        >
          <Ionicons name="shuffle" size={18} color={COLOR.accent} />
        </Pressable>
      }
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      skeletonLines={2}
    >
      <View style={styles.body}>
        <Text style={styles.fact}>{data ?? "No facts available."}</Text>
      </View>
    </HomeCard>
  );
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.6,
  },
  body: {
    borderLeftWidth: 2,
    borderLeftColor: COLOR.accentBorder,
    paddingLeft: SPACE.md,
  },
  fact: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 15,
    lineHeight: 24,
    color: COLOR.textBody,
  },
});

export default FunFactCard;
