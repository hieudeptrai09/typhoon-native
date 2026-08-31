import CountryFlag, { COUNTRY_NAMES } from "@/lib/components/common/CountryFlag";
import EdgeFade from "@/lib/components/common/EdgeFade";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants/position";
import { COLOR, SPACE } from "@/lib/constants/theme";
import { getPositionTitle, positionColumnLetter } from "@/lib/utils/position";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRef, useState, type ReactNode } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

interface CountryPagerProps {
  renderPosition: (position: number) => ReactNode;
  onPositionPress?: (position: number) => void;
  positionEnabled?: (position: number) => boolean;
}

const TAB_WIDTH = 56;

const CountryPager = ({ renderPosition, onPositionPress, positionEnabled }: CountryPagerProps) => {
  const [pageWidth, setPageWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const pagerRef = useRef<FlatList<string>>(null);
  const tabsRef = useRef<ScrollView>(null);

  const goTo = (next: number) => {
    if (next === index) return;
    Haptics.selectionAsync();
    setIndex(next);
    if (pageWidth > 0)
      pagerRef.current?.scrollToOffset({ offset: next * pageWidth, animated: true });
    centreTab(next);
  };

  const centreTab = (target: number) => {
    tabsRef.current?.scrollTo({
      x: Math.max(0, target * TAB_WIDTH - pageWidth / 2 + TAB_WIDTH / 2),
      animated: true,
    });
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth <= 0) return;
    const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    if (next === index) return;
    setIndex(next);
    centreTab(next);
  };

  const handleLayout = (event: LayoutChangeEvent) => setPageWidth(event.nativeEvent.layout.width);

  const renderPage = ({ index: col }: { index: number }) => (
    <ScrollView
      style={{ width: pageWidth }}
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
    >
      {Array.from({ length: GRID_ROWS }, (_, row) => {
        const position = row * GRID_COLS + col + 1;
        const enabled = positionEnabled?.(position) ?? Boolean(onPositionPress);

        return (
          <Pressable
            key={position}
            onPress={enabled ? () => onPositionPress?.(position) : undefined}
            disabled={!enabled}
            style={({ pressed }) => [styles.row, pressed && enabled && styles.rowPressed]}
            android_ripple={enabled ? { color: COLOR.accentSoft } : undefined}
            accessibilityRole={enabled ? "button" : "text"}
            accessibilityLabel={`Position ${getPositionTitle(position)}`}
          >
            <View style={styles.positionChip}>
              <Text style={styles.positionText}>{getPositionTitle(position)}</Text>
            </View>
            <View style={styles.rowContent}>{renderPosition(position)}</View>
            {enabled && <Ionicons name="chevron-forward" size={16} color={COLOR.textFaint} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.root}>
      <EdgeFade scrollRef={tabsRef} contentContainerStyle={styles.tabs} accessibilityRole="tablist">
        {COUNTRY_NAMES.map((country, col) => (
          <Pressable
            key={country}
            onPress={() => goTo(col)}
            style={[styles.tab, col === index && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: col === index }}
            accessibilityLabel={country}
          >
            <CountryFlag country={country} size={20} />
            <Text style={[styles.tabLetter, col === index && styles.tabLetterActive]}>
              {positionColumnLetter(col)}
            </Text>
          </Pressable>
        ))}
      </EdgeFade>

      <View style={styles.pageHeader}>
        <CountryFlag country={COUNTRY_NAMES[index]} size={18} showName />
        <Text style={styles.pageHint}>Swipe for the next country</Text>
      </View>

      <View style={styles.pager} onLayout={handleLayout}>
        {pageWidth > 0 && (
          <FlatList
            ref={pagerRef}
            data={COUNTRY_NAMES}
            keyExtractor={(country) => country}
            renderItem={renderPage}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
            getItemLayout={(_data, itemIndex) => ({
              length: pageWidth,
              offset: pageWidth * itemIndex,
              index: itemIndex,
            })}
            initialNumToRender={2}
            windowSize={3}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 10,
  },
  tabs: {
    paddingHorizontal: SPACE.lg,
    gap: SPACE.xs,
  },
  tab: {
    width: TAB_WIDTH - 4,
    alignItems: "center",
    gap: 2,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  tabActive: {
    backgroundColor: COLOR.accentSoft,
    borderColor: COLOR.accent,
  },
  tabLetter: {
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 11,
    color: COLOR.textFaint,
  },
  tabLetterActive: {
    color: COLOR.accent,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  pageHint: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 11,
    color: COLOR.textFaint,
  },
  pager: {
    flex: 1,
  },
  page: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLOR.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR.border,
  },
  rowPressed: {
    opacity: 0.8,
  },
  positionChip: {
    minWidth: 38,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLOR.surfaceMuted,
    alignItems: "center",
  },
  positionText: {
    fontFamily: "OpenSans_700Bold",
    fontSize: 12,
    color: COLOR.textBody,
  },
  rowContent: {
    flex: 1,
  },
});

export default CountryPager;
