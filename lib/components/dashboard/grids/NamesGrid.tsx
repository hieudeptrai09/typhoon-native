import CountryPager from "@/lib/components/position/CountryPager";
import type { Storm } from "@/lib/types";
import { sortNamesByFirstYear } from "@/lib/utils/storm/aggregate";
import { useMemo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface NamesGridProps {
  stormsData: Storm[];
  onCellClick: (data: number | string, key: string) => void;
  nameColors?: Record<string, string>;
  nameSubtitles?: Record<string, ReactNode>;
}

const NamesGrid = ({ stormsData, onCellClick, nameColors, nameSubtitles }: NamesGridProps) => {
  const namesByPosition = useMemo(() => {
    const byPosition = new Map<number, Record<string, Storm[]>>();
    stormsData.forEach((storm) => {
      const group = byPosition.get(storm.position) ?? {};
      (group[storm.name] ??= []).push(storm);
      byPosition.set(storm.position, group);
    });

    const result = new Map<number, string[]>();
    byPosition.forEach((group, position) => {
      result.set(
        position,
        sortNamesByFirstYear(Object.entries(group)).map(([name]) => name),
      );
    });
    return result;
  }, [stormsData]);

  return (
    <CountryPager
      positionEnabled={() => false}
      renderPosition={(position) => {
        const names = namesByPosition.get(position) ?? [];
        if (names.length === 0) return <Text style={styles.empty}>—</Text>;

        return (
          <View style={styles.names}>
            {names.map((name) => (
              <Pressable
                key={name}
                onPress={() => onCellClick(name, "name")}
                style={({ pressed }) => [styles.name, pressed && styles.namePressed]}
                accessibilityRole="button"
                accessibilityLabel={`View details for ${name}`}
              >
                <Text style={[styles.nameText, { color: nameColors?.[name] ?? "#374151" }]}>
                  {name}
                </Text>
                {nameSubtitles?.[name] !== undefined && (
                  <Text style={styles.subtitle}>{nameSubtitles[name]}</Text>
                )}
              </Pressable>
            ))}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  names: {
    gap: 6,
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
  subtitle: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 11,
    color: "#64748b",
    fontVariant: ["tabular-nums"],
  },
  empty: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: "#cbd5e1",
  },
});

export default NamesGrid;
