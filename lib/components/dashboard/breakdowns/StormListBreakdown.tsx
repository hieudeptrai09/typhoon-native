import IntensityBadge from "@/lib/components/storm/IntensityBadge";
import { INTENSITY_LABEL, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { StyleSheet, Text, View } from "react-native";

interface StormListBreakdownProps {
  storms: Storm[];
}

const StormListBreakdown = ({ storms }: StormListBreakdownProps) => {
  const byName = storms.reduce<Record<string, Storm[]>>((acc, storm) => {
    (acc[storm.name] ??= []).push(storm);
    return acc;
  }, {});

  const groups = Object.entries(byName);
  if (groups.length === 0) return <Text style={styles.empty}>No storms recorded here yet.</Text>;

  return (
    <View>
      {groups.map(([name, group], index) => (
        <View key={name} style={[styles.group, index > 0 && styles.groupDivided]}>
          {group.map((storm) => (
            <View key={`${storm.name}-${storm.year}`} style={styles.storm}>
              <IntensityBadge intensity={storm.intensity} size={30} />

              <View style={styles.text}>
                <Text
                  style={[styles.name, { color: TEXT_COLOR_WHITE_BACKGROUND[storm.intensity] }]}
                >
                  {storm.name} {storm.year}
                  {storm.jtwcDesignation ? ` (${storm.jtwcDesignation})` : ""}
                </Text>
                <Text style={styles.intensity}>{INTENSITY_LABEL[storm.intensity]}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  // A position that reused its slot under a new name reads as two blocks, not one long run.
  groupDivided: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR.borderStrong,
  },
  storm: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: {
    flex: 1,
  },
  name: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
  },
  intensity: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 12,
    color: COLOR.textMuted,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textMuted,
  },
});

export default StormListBreakdown;
