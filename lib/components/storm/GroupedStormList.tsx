import { useRefreshControl } from "@/lib/components/common/RefreshContext";
import StormCard from "@/lib/components/storm/StormCard";
import { BACKGROUND_BADGE, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import { COLOR, HIT_SIZE, RADIUS, SPACE } from "@/lib/constants/theme";
import type { Storm } from "@/lib/types";
import { getDistanceColor } from "@/lib/utils/colors";
import {
  calculateAverage,
  calculateGapAverage,
  formatDistance,
  getIntensityFromNumber,
} from "@/lib/utils/storm/aggregate";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useMemo, useState, type ReactElement } from "react";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface StormGroup {
  key: string;
  label: string;
  storms: Storm[];
  // A group with a screen of its own (a position) gets an open button beside its header.
  onOpen?: () => void;
  openLabel?: string;
}

interface GroupSection extends StormGroup {
  data: Storm[];
  average: number;
  recurrence: number;
}

interface GroupedStormListProps {
  groups: StormGroup[];
  header: ReactElement;
  showRecurrence?: boolean;
}

const GroupHeader = ({
  group,
  collapsed,
  showRecurrence,
  onToggle,
}: {
  group: GroupSection;
  collapsed: boolean;
  showRecurrence: boolean;
  onToggle: () => void;
}) => {
  const intensity = getIntensityFromNumber(group.average);

  return (
    <View style={styles.headerWrap}>
      <View style={[styles.header, { borderLeftColor: BACKGROUND_BADGE[intensity] }]}>
        <Pressable
          onPress={onToggle}
          style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityState={{ expanded: !collapsed }}
          accessibilityLabel={`${group.label}, ${group.storms.length} storms`}
        >
          <View style={styles.body}>
            <Text style={styles.label}>{group.label}</Text>

            <View style={styles.stats}>
              <Text style={styles.stat}>
                Count: <Text style={styles.statValue}>{group.storms.length}</Text>
              </Text>
              <Text style={styles.stat}>
                Avg:{" "}
                <Text style={[styles.statValue, { color: TEXT_COLOR_WHITE_BACKGROUND[intensity] }]}>
                  {group.average.toFixed(2)}
                </Text>
              </Text>
              {/* A lone storm leaves no gap to measure, so the stat is left off entirely. */}
              {showRecurrence && group.recurrence >= 0 && (
                <Text style={styles.stat}>
                  Every:{" "}
                  <Text style={[styles.statValue, { color: getDistanceColor(group.recurrence) }]}>
                    {formatDistance(group.recurrence)}
                  </Text>{" "}
                  yrs
                </Text>
              )}
            </View>
          </View>

          <Ionicons
            name={collapsed ? "chevron-down" : "chevron-up"}
            size={18}
            color={COLOR.textMuted}
          />
        </Pressable>

        {group.onOpen && (
          <Pressable
            onPress={group.onOpen}
            style={({ pressed }) => [styles.open, pressed && styles.pressed]}
            accessibilityRole="link"
            accessibilityLabel={group.openLabel ?? `Open ${group.label}`}
          >
            <Ionicons name="arrow-forward-circle-outline" size={24} color={COLOR.accent} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const GroupedStormList = ({ groups, header, showRecurrence = true }: GroupedStormListProps) => {
  const refreshControl = useRefreshControl();
  const insets = useSafeAreaInsets();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const measured = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        average: calculateAverage(group.storms),
        recurrence: calculateGapAverage(group.storms),
      })),
    [groups],
  );

  const sections = useMemo<GroupSection[]>(
    () => measured.map((group) => ({ ...group, data: collapsed[group.key] ? [] : group.storms })),
    [measured, collapsed],
  );

  const toggle = (key: string) => {
    Haptics.selectionAsync();
    setCollapsed((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <SectionList<Storm, GroupSection>
      sections={sections}
      keyExtractor={(storm, index) => `${storm.name}-${storm.year}-${index}`}
      // One card per row: a track map at half a phone's width is unreadable.
      renderItem={({ item }) => (
        <View style={styles.card}>
          <StormCard storm={item} />
        </View>
      )}
      renderSectionHeader={({ section }) => (
        <GroupHeader
          group={section}
          collapsed={Boolean(collapsed[section.key])}
          showRecurrence={showRecurrence}
          onToggle={() => toggle(section.key)}
        />
      )}
      ListHeaderComponent={header}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACE.xl }]}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled
      // Every card carries a remote track map, and a long history runs to dozens of them.
      initialNumToRender={4}
      windowSize={7}
      removeClippedSubviews
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.lg,
  },
  // Opaque and full-bleed, so cards scrolling under the pinned header stay hidden.
  headerWrap: {
    paddingBottom: SPACE.md,
    backgroundColor: COLOR.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 56,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLOR.border,
    backgroundColor: COLOR.surface,
    overflow: "hidden",
  },
  toggle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
  },
  open: {
    width: HIT_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: COLOR.border,
  },
  pressed: {
    backgroundColor: COLOR.surfaceMuted,
  },
  body: {
    flex: 1,
    gap: SPACE.xs,
  },
  label: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.textSecondary,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: SPACE.md,
    rowGap: 2,
  },
  stat: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 13,
    color: COLOR.textBody,
  },
  statValue: {
    fontFamily: "OpenSans_600SemiBold",
    color: COLOR.textSecondary,
  },
  card: {
    paddingBottom: SPACE.lg,
  },
});

export default GroupedStormList;
