import DefModal from "@/lib/components/common/DefModal";
import OpenDetailButton, { type DetailTarget } from "@/lib/components/common/OpenDetailButton";
import StatTile from "@/lib/components/common/StatTile";
import { COLOR, SPACE } from "@/lib/constants/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export interface GroupStat {
  label: string;
  value: ReactNode;
  hint?: string;
}

interface GroupSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  accentColor?: string;
  /** Headline numbers for the group, in the same slot whatever the metric is. */
  stats: GroupStat[];
  /** Only position and name groups have a screen of their own; year/month/country do not. */
  target?: DetailTarget;
  children: ReactNode;
}

/**
 * The one sheet every dashboard group opens into. Header, stat tiles and footer stay put across
 * metrics so only the breakdown below them has to be read anew.
 */
const GroupSheet = ({
  open,
  onClose,
  title,
  accentColor,
  stats,
  target,
  children,
}: GroupSheetProps) => (
  <DefModal
    open={open}
    onClose={onClose}
    title={
      <Text style={[styles.title, accentColor ? { color: accentColor } : null]} numberOfLines={1}>
        {title}
      </Text>
    }
    footer={target ? <OpenDetailButton target={target} onClose={onClose} /> : undefined}
  >
    {stats.length > 0 && (
      <View style={styles.tiles}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.tile}>
            <StatTile label={stat.label} hint={stat.hint}>
              {stat.value}
            </StatTile>
          </View>
        ))}
      </View>
    )}

    {children}
  </DefModal>
);

const styles = StyleSheet.create({
  title: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 22,
    color: COLOR.text,
  },
  tiles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACE.sm,
    marginBottom: SPACE.lg,
  },
  // Two per row on a phone; the tile itself carries no width of its own.
  tile: {
    flexGrow: 1,
    flexBasis: "45%",
  },
});

export default GroupSheet;
