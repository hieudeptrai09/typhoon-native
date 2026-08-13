import EmptyResults from "@/lib/components/common/EmptyResults";
import { COLOR, SPACE } from "@/lib/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface RecentSearchesProps {
  names: string[];
  onOpen: (name: string) => void;
  onClear: () => void;
}

/**
 * What the Search tab shows before anything is typed. A tab the user chose to open should not
 * answer with an empty screen, and the name they looked up yesterday is the likeliest thing they
 * came back for.
 */
const RecentSearches = ({ names, onOpen, onClear }: RecentSearchesProps) => {
  if (names.length === 0) {
    return (
      // A scroller rather than a centred flex box: the field has just taken focus, so the keyboard
      // is up and anything vertically centred ends up behind it.
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <EmptyResults
          icon="search-outline"
          description="Type a name to search. Names you open will wait here next time."
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Recent</Text>
        <Pressable
          onPress={onClear}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Clear recent searches"
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.clear}>Clear</Text>
        </Pressable>
      </View>

      {names.map((name) => (
        <Pressable
          key={name}
          onPress={() => onOpen(name)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          android_ripple={{ color: COLOR.accentSoft }}
          accessibilityRole="button"
        >
          <Ionicons name="time-outline" size={18} color={COLOR.textMuted} />
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} />
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACE.lg,
    paddingBottom: SPACE.xxl,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: SPACE.xs,
  },
  title: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.textMuted,
  },
  clear: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 13,
    color: COLOR.accent,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 52,
    paddingHorizontal: 14,
    backgroundColor: COLOR.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
    overflow: "hidden",
  },
  name: {
    flex: 1,
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 15,
    color: COLOR.text,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default RecentSearches;
