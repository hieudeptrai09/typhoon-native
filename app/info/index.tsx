import { useQuery } from "@/lib/api/client";
import FrownError from "@/lib/components/common/FrownError";
import ScreenLoading from "@/lib/components/common/ScreenLoading";
import StaleBanner from "@/lib/components/common/StaleBanner";
import { COLOR, RADIUS, SPACE } from "@/lib/constants/theme";
import { getNameList } from "@/lib/data/getNameList";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Row = { kind: "letter"; letter: string } | { kind: "name"; name: string };

// Fixed heights let getItemLayout place a letter that has not rendered yet, which a jump needs.
const LETTER_HEIGHT = 40;
const NAME_HEIGHT = 48;

export default function NamesIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Row>>(null);
  const { data, isLoading, isError, isRefetching, refetch } = useQuery("name-list", getNameList);

  const { rows, letterIndex, offsets } = useMemo(() => {
    const sorted = [...(data ?? [])].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
    const built: Row[] = [];
    const indexByLetter = new Map<string, number>();
    sorted.forEach((name) => {
      const letter = name.charAt(0).toUpperCase();
      if (!indexByLetter.has(letter)) {
        indexByLetter.set(letter, built.length);
        built.push({ kind: "letter", letter });
      }
      built.push({ kind: "name", name });
    });

    const starts: number[] = [];
    let offset = 0;
    built.forEach((row) => {
      starts.push(offset);
      offset += row.kind === "letter" ? LETTER_HEIGHT : NAME_HEIGHT;
    });

    return { rows: built, letterIndex: indexByLetter, offsets: starts };
  }, [data]);

  const stickyIndices = useMemo(() => [...letterIndex.values()], [letterIndex]);

  if (isLoading) return <ScreenLoading />;
  if (!data) return <FrownError onRetry={refetch} />;

  const jump = (letter: string) => {
    const index = letterIndex.get(letter);
    if (index === undefined) return;
    Haptics.selectionAsync();
    listRef.current?.scrollToIndex({ index, animated: false });
  };

  return (
    <View style={styles.root}>
      {isError && <StaleBanner />}

      <View style={styles.strip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stripContent}
          accessibilityLabel="Jump to letter"
        >
          {[...letterIndex.keys()].map((letter) => (
            <Pressable
              key={letter}
              onPress={() => jump(letter)}
              style={({ pressed }) => [styles.letterButton, pressed && styles.letterPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Jump to ${letter}`}
            >
              <Text style={styles.letterButtonLabel}>{letter}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(row) =>
          row.kind === "letter" ? `letter-${row.letter}` : `name-${row.name}`
        }
        getItemLayout={(_rows, index) => ({
          length: rows[index]?.kind === "letter" ? LETTER_HEIGHT : NAME_HEIGHT,
          offset: offsets[index] ?? 0,
          index,
        })}
        stickyHeaderIndices={stickyIndices}
        renderItem={({ item }) =>
          item.kind === "letter" ? (
            <View style={styles.letterRow}>
              <Text style={styles.letter} accessibilityRole="header">
                {item.letter}
              </Text>
            </View>
          ) : (
            <Pressable
              onPress={() => router.push(`/info/${encodeURIComponent(item.name.toLowerCase())}`)}
              style={({ pressed }) => [styles.nameRow, pressed && styles.namePressed]}
              android_ripple={{ color: COLOR.accentSoft }}
              accessibilityRole="link"
            >
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} />
            </Pressable>
          )
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + SPACE.xl }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLOR.accent]}
            tintColor={COLOR.accent}
          />
        }
        initialNumToRender={20}
        windowSize={11}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  strip: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.border,
    backgroundColor: COLOR.surface,
  },
  stripContent: {
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
  },
  letterButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.sm,
  },
  letterPressed: {
    backgroundColor: COLOR.accentSoft,
  },
  letterButtonLabel: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 15,
    color: COLOR.accent,
  },
  letterRow: {
    height: LETTER_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: SPACE.lg,
    backgroundColor: COLOR.background,
  },
  letter: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 15,
    color: COLOR.textSecondary,
  },
  nameRow: {
    height: NAME_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
    backgroundColor: COLOR.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.border,
  },
  namePressed: {
    backgroundColor: COLOR.surfaceMuted,
  },
  name: {
    flex: 1,
    fontFamily: "OpenSans_500Medium",
    fontSize: 15,
    color: COLOR.text,
  },
});
