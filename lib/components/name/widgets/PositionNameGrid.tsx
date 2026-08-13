import CountryPager from "@/lib/components/position/CountryPager";
import { COLOR } from "@/lib/constants/theme";
import type { IconName, TyphoonName } from "@/lib/types";
import { getNameStatusColor } from "@/lib/utils/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const TAG_ICONS: Record<string, IconName> = {
  Animal: "paw-outline",
  "Celestial body": "moon-outline",
  Concept: "library-outline",
  Deity: "flash-outline",
  Descriptive: "pricetag-outline",
  "Food and beverage": "fast-food-outline",
  Mineral: "diamond-outline",
  Nature: "cloudy-outline",
  "People's name": "person-outline",
  Place: "location-outline",
  Plant: "leaf-outline",
  Thing: "hammer-outline",
};

const HISTORY_COUNT_COLORS = ["", COLOR.success, COLOR.accent, COLOR.warning];
const getHistoryCountColor = (count: number) =>
  count >= 4 ? COLOR.danger : HISTORY_COUNT_COLORS[count] || COLOR.textSecondary;

const TagIcon = ({
  tag,
  size = 18,
  colorOverride,
}: {
  tag: string;
  size?: number;
  colorOverride?: string;
}) => {
  const icon = TAG_ICONS[tag];
  if (!icon) return null;
  // One neutral for every tag: the icon shape and the label beside it already name the category,
  // so a per-tag hue would only add a colour that says nothing.
  return <Ionicons name={icon} size={size} color={colorOverride || COLOR.textBody} />;
};

const sortByOldest = (names: TyphoonName[]) => [...names].sort((a, b) => a.id - b.id);

interface PositionNameGridProps {
  names: TyphoonName[];
  showName: boolean;
  showHistory: boolean;
  colorfulHistory?: boolean;
  onNameClick: (name: TyphoonName) => void;
  onCellClick: (position: number, names: TyphoonName[]) => void;
}

const PositionNameGrid = ({
  names,
  showName,
  showHistory,
  colorfulHistory = false,
  onNameClick,
  onCellClick,
}: PositionNameGridProps) => {
  const namesByPosition = useMemo(
    () =>
      names.reduce<Record<number, TyphoonName[]>>((acc, name) => {
        if (name.retirementReason === "misspell") return acc;
        (acc[name.position] ??= []).push(name);
        return acc;
      }, {}),
    [names],
  );

  const renderName = (name: TyphoonName, colorOverride?: string) => (
    <Pressable
      key={name.id}
      onPress={() => onNameClick(name)}
      style={({ pressed }) => [styles.name, pressed && styles.namePressed]}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${name.name}`}
    >
      {showName ? (
        <Text style={[styles.nameText, { color: colorOverride || getNameStatusColor(name) }]}>
          {name.name}
        </Text>
      ) : (
        <View style={styles.tagRow}>
          <TagIcon tag={name.tag} colorOverride={colorOverride} />
          <Text style={styles.tagLabel}>{name.tag}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <CountryPager
      positionEnabled={(position) => (namesByPosition[position]?.length ?? 0) > 0}
      onPositionPress={(position) => onCellClick(position, namesByPosition[position] ?? [])}
      renderPosition={(position) => {
        const positionNames = namesByPosition[position] ?? [];
        if (positionNames.length === 0) return <Text style={styles.empty}>—</Text>;

        if (!showHistory) return <View>{renderName(positionNames[0])}</View>;

        const colorOverride = colorfulHistory
          ? getHistoryCountColor(positionNames.length)
          : undefined;
        return (
          <View style={styles.history}>
            {sortByOldest(positionNames).map((name) => renderName(name, colorOverride))}
          </View>
        );
      }}
      footer={
        showName ? null : (
          <View style={styles.legend}>
            {Object.keys(TAG_ICONS).map((tag) => (
              <View key={tag} style={styles.legendItem}>
                <TagIcon tag={tag} size={14} />
                <Text style={styles.legendLabel}>{tag}</Text>
              </View>
            ))}
          </View>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  history: {
    gap: 4,
  },
  name: {
    minHeight: 32,
    justifyContent: "center",
  },
  namePressed: {
    opacity: 0.6,
  },
  nameText: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tagLabel: {
    fontFamily: "OpenSans_500Medium",
    fontSize: 13,
    color: COLOR.textBody,
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: COLOR.disabled,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    rowGap: 8,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendLabel: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 11,
    color: COLOR.textBody,
  },
});

export default PositionNameGrid;
